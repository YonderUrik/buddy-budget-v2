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
    const data = await request.json();

    // Override userId with the authenticated user's ID
    data.userId = userId;

    const account = await prisma.liquidityAccount.create({
      data,
    });

    return NextResponse.json(account, { status: 201 });
  } catch (error) {
    console.error('Error creating liquidity account:', error);
    return NextResponse.json(
      { error: 'Failed to create liquidity account' },
      { status: 500 }
    );
  }
} 