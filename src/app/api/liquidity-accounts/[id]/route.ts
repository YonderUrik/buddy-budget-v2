import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/liquidity-accounts/[id]
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const { id } = params;
    
    const account = await prisma.liquidityAccount.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!account) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    return NextResponse.json(account);
  } catch (error) {
    console.error('Error fetching liquidity account:', error);
    return NextResponse.json(
      { error: 'Failed to fetch liquidity account' },
      { status: 500 }
    );
  }
}

// PATCH /api/liquidity-accounts/[id]
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const primaryCurrency = session.user.primaryCurrency
    const { id } = params;
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated by the client
    delete data.id;
    delete data.userId;
    delete data.createdAt;
    delete data.isDeleted;
    delete data.deletedAt;
    
    // Use a transaction to ensure data consistency across related operations
    const result = await prisma.$transaction(async (tx) => {
      // First check if the account exists and belongs to the user
      const existingAccount = await tx.liquidityAccount.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!existingAccount) {
        throw new Error('Account not found');
      }

      // Update the liquidity account
      const updatedAccount = await tx.liquidityAccount.update({
        where: { id },
        data: {
          ...data,
          updatedAt: new Date(),
        },
      });

      // If balance was updated, create a new AssetValuation record
      if (data.balance !== undefined && data.balance !== existingAccount.balance) {
        await tx.assetValuation.create({
          data: {
            assetId: id,
            assetType: 'liquidity',
            date: new Date(),
            value: updatedAccount.balance,
            currency: primaryCurrency,
            createdAt: new Date(),
            isDeleted: false,
          },
        });

        // Update WealthSnapshot
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to beginning of day for consistent snapshots
        
        // Get existing snapshot for today
        const existingSnapshot = await tx.wealthSnapshot.findFirst({
          where: {
            userId,
            date: {
              gte: today,
              lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
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
              date: today,
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

      return updatedAccount;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating liquidity account:', error);
    
    if ((error as Error).message === 'Account not found') {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to update liquidity account' },
      { status: 500 }
    );
  }
}

// DELETE /api/liquidity-accounts/[id]
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = session.user.id;
    const primaryCurrency = session.user.primaryCurrency
    const { id } = params;
    
    // Use a transaction to ensure data consistency across related operations
    const result = await prisma.$transaction(async (tx) => {
      // First check if the account exists and belongs to the user
      const existingAccount = await tx.liquidityAccount.findUnique({
        where: {
          id,
          userId,
        },
      });

      if (!existingAccount) {
        throw new Error('Account not found');
      }

      // Soft delete the account
      const deletedAccount = await tx.liquidityAccount.update({
        where: { id },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Soft delete associated asset valuations
      await tx.assetValuation.updateMany({
        where: {
          assetId: id,
          assetType: 'liquidity',
          isDeleted: false,
        },
        data: {
          isDeleted: true,
          deletedAt: new Date(),
        },
      });

      // Update WealthSnapshot
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Reset to beginning of day for consistent snapshots
      
      // Get existing snapshot for today
      const existingSnapshot = await tx.wealthSnapshot.findFirst({
        where: {
          userId,
          date: {
            gte: today,
            lt: new Date(today.getTime() + 24 * 60 * 60 * 1000), // Next day
          },
        },
      });

      // Calculate total liquidity (now excluding the deleted account)
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
            date: today,
            currency: primaryCurrency, // Default to USD
            liquidityTotal,
            marketInvestmentsTotal: 0,
            cryptoInvestmentsTotal: 0,
            retirementInvestmentsTotal: 0,
            realEstateInvestmentsTotal: 0,
            liabilitiesTotal: 0,
            netWorth: liquidityTotal,
            createdAt: new Date(),
            isDeleted: false,
          },
        });
      }

      return deletedAccount;
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error deleting liquidity account:', error);
    
    if ((error as Error).message === 'Account not found') {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }
    
    return NextResponse.json(
      { error: 'Failed to delete liquidity account' },
      { status: 500 }
    );
  }
} 