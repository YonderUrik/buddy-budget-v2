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
    const { id } = params;
    const data = await request.json();
    
    // Remove any fields that shouldn't be updated by the client
    delete data.id;
    delete data.userId;
    delete data.createdAt;
    delete data.isDeleted;
    delete data.deletedAt;
    
    // First check if the account exists and belongs to the user
    const existingAccount = await prisma.liquidityAccount.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    const updatedAccount = await prisma.liquidityAccount.update({
      where: { id },
      data: {
        ...data,
        updatedAt: new Date(),
      },
    });

    return NextResponse.json(updatedAccount);
  } catch (error) {
    console.error('Error updating liquidity account:', error);
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
    const { id } = params;
    
    // First check if the account exists and belongs to the user
    const existingAccount = await prisma.liquidityAccount.findUnique({
      where: {
        id,
        userId,
      },
    });

    if (!existingAccount) {
      return NextResponse.json({ error: 'Account not found' }, { status: 404 });
    }

    // Soft delete
    const deletedAccount = await prisma.liquidityAccount.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json(deletedAccount);
  } catch (error) {
    console.error('Error deleting liquidity account:', error);
    return NextResponse.json(
      { error: 'Failed to delete liquidity account' },
      { status: 500 }
    );
  }
} 