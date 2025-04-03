import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/liquidity-accounts
export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;

    const accounts = await prisma.liquidityAccount.findMany({
      where: {
        userId,
        isDeleted: false,
      },
      orderBy: {
        balance: 'desc',
      },
    });

    return NextResponse.json(accounts);
  } catch (error) {
    console.error('Error fetching liquidity accounts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity accounts' },
      { status: 500 }
    );
  }
}

// POST /api/liquidity-accounts
export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const primaryCurrency = session.user.primaryCurrency
    const data = await request.json();

    // Override userId with the authenticated user's ID
    data.userId = userId;

    // Validate and ensure data respects the LiquidityAccount model
    if (!data.name || !data.type || typeof data.balance !== 'number' || data.balance < 0) {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    // Ensure type is one of the allowed values
    const allowedTypes = ['checking', 'savings', 'cash', 'other'];
    if (!allowedTypes.includes(data.type)) {
      return NextResponse.json({ error: 'Invalid account type' }, { status: 400 });
    }

    // Use a transaction to ensure data consistency across related operations
    const result = await prisma.$transaction(async (tx) => {
      // Create the liquidity account
      const account = await tx.liquidityAccount.create({
        data,
      });

      // Create an AssetValuation record for the new account
      await tx.assetValuation.create({
        data: {
          assetId: account.id,
          assetType: 'liquidity',
          date: new Date(),
          value: account.balance,
          currency: primaryCurrency,
          createdAt: new Date(),
          isDeleted: false,
        },
      });

      await updateWealthSnapshot(new Date(), userId, primaryCurrency, tx);






      return account;
    });

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error('Error creating liquidity account:', error);
    return NextResponse.json(
      { error: 'Failed to create liquidity account' },
      { status: 500 }
    );
  }
}

async function updateWealthSnapshot(date: Date, userId: string, primaryCurrency: string, tx: PrismaClient) {
  // Update or create WealthSnapshot

  date.setHours(0, 0, 0, 0); // Reset to beginning of day for consistent snapshots

  // Get existing snapshot for today
  const existingSnapshot = await tx.wealthSnapshot.findFirst({
    where: {
      userId,
      date: {
        gte: date,
        lt: new Date(date.getTime() + 24 * 60 * 60 * 1000), // Next day
      },
    },
  });

  // Calculate total liquidity
  const liquidityAccounts = await tx.liquidityAccount.findMany({
    where: {
      userId,
      isDeleted: false,
    },
  });

  const liquidityTotal = liquidityAccounts.reduce(
    (sum, acc) => sum + acc.balance,
    0
  );

  if (existingSnapshot) {
    // Update existing snapshot
    await tx.wealthSnapshot.update({
      where: { id: existingSnapshot.id },
      data: {
        liquidityTotal,
        netWorth:
          liquidityTotal +
          existingSnapshot.marketInvestmentsTotal +
          existingSnapshot.cryptoInvestmentsTotal +
          existingSnapshot.retirementInvestmentsTotal +
          existingSnapshot.realEstateInvestmentsTotal -
          existingSnapshot.liabilitiesTotal,
      },
    });
  } else {
    // Create new snapshot
    await tx.wealthSnapshot.create({
      data: {
        userId,
        date: date,
        currency: primaryCurrency,
        liquidityTotal,
        marketInvestmentsTotal: 0,
        cryptoInvestmentsTotal: 0,
        retirementInvestmentsTotal: 0,
        realEstateInvestmentsTotal: 0,
        liabilitiesTotal: 0,
        netWorth: liquidityTotal, // Initially just the liquidity
        createdAt: new Date(),
        isDeleted: false,
      },
    });
  }
}