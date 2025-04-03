import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient, Transaction } from '@prisma/client';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/auth';

const prisma = new PrismaClient();

// GET /api/transactions
// TODO : Rivedere la query per la lookup delle categorie
export async function GET() {
   try {
      const session = await getServerSession(authOptions);

      if (!session || !session.user) {
         return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }

      const userId = session.user.id;

      const transactions = await prisma.transaction.findMany({
         where: {
            userId,
            isDeleted: false,
         },
         orderBy: {
            date: 'desc',
         },
         include: {
            category: true,
         },
      });

      return NextResponse.json(transactions);
   } catch (error) {
      console.error('Error fetching transactions:', error);
      return NextResponse.json(
         { error: 'Failed to fetch transactions' },
         { status: 500 }
      );
   }
}

// POST /api/transactions
export async function POST(request: NextRequest) {
   const session = await getServerSession(authOptions);

   if (!session || !session.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
   }

   const userId = session.user.id;
   const primaryCurrency = session.user.primaryCurrency
   const data = await request.json();

   // Override userId with the authenticated user's ID
   data.userId = userId;

   try {
      // Basic validation
      if (!['income', 'expense', 'transfer'].includes(data.type)) {
         return NextResponse.json({ error: 'Invalid transaction type' }, { status: 400 });
      }

      if (typeof data.amount !== 'number' || data.amount <= 0) {
         return NextResponse.json({ error: 'Invalid amount' }, { status: 400 });
      }

      // For non-transfer transactions, validate account and category
      if (data.type !== 'transfer') {
         if (!data?.categoryId || !data?.accountId) {
            return NextResponse.json({ error: 'Invalid category or account' }, { status: 400 });
         }
      } else {
         // For transfers, validate source and destination accounts
         if (!data?.accountId) {
            return NextResponse.json({ error: 'Source account is required' }, { status: 400 });
         }

         // If not external, require destination account
         if (!data.isExternalAccount && !data?.destinationAccountId) {
            return NextResponse.json({ error: 'Destination account is required for internal transfers' }, { status: 400 });
         }

         // Prevent transferring to the same account
         if (data.destinationAccountId && data.accountId === data.destinationAccountId) {
            return NextResponse.json({ error: 'Source and destination accounts cannot be the same' }, { status: 400 });
         }
      }

      // Set currency to primaryCurrency if not provided
      if (!data.currency) {
         data.currency = primaryCurrency || 'EUR';
      }

      // Ensure the date is a valid date object
      if (!data.date) {
         data.date = new Date();
      } else {
         data.date = new Date(data.date);
      }

      // Check that the category exists
      const category = await prisma.category.findUnique({
         where: { id: data.categoryId }
      });

      if (!category) {
         return NextResponse.json({ error: 'Category not found' }, { status: 400 });
      }
      

      const response = await prisma.$transaction(async (tx) => {
         // Create the transaction
         const transaction = await tx.transaction.create({
            data: {
               userId: userId,
               accountId: data.accountId,
               destinationAccountId: data.type === 'transfer' ? data.destinationAccountId : null,
               date: data.date,
               amount: data.amount,
               currency: data.currency,
               type: data.type,
               categoryId: data.categoryId || null,
               description: data.description || null,
               isRecurring: !!data.isRecurring,
               recurringId: data.recurringId || null,
               budgetId: data.budgetId || null,
               tags: data.tags || [],
               createdAt: new Date(),
               updatedAt: new Date(),
               isDeleted: false,
               deletedAt: null
            }
         });

         // Update account balances
         await updateAccountBalances(transaction);

         return { success: true, transaction };
      })

      if (!response.success) {
         return NextResponse.json({ error: 'Failed to create transaction' }, { status: 500 });
      }

      return NextResponse.json({
         success: true,
         transaction: response.transaction
      });

   } catch (error) {
      console.error('Error creating transaction:', error);
      return NextResponse.json({
         error: 'Failed to create transaction',
         details: error.message
      }, { status: 500 });
   }

}

async function updateAccountBalances(transaction: Transaction) {
   const { type, amount, accountId, destinationAccountId, isExternalAccount } = transaction;


   // Get the source account
   const sourceAccount = await prisma.liquidityAccount.findUnique({
      where: { id: accountId }
   });

   if (!sourceAccount) {
      throw new Error('Source account not found');
   }

   if(destinationAccountId) {
      // Get the destination account
      const destinationAccount = await prisma.liquidityAccount.findUnique({
         where: { id: destinationAccountId }
      });

      if (!destinationAccount) {
         throw new Error('Destination account not found');
      }
   }

   if(type === 'income') {
      // Update the source account balance
      await prisma.liquidityAccount.update({
         where: { id: accountId },
         data: { balance: { increment: amount }, updatedAt: new Date() }
      });
   } else if(type === 'expense') {
      // Update the source account balance
      await prisma.liquidityAccount.update({
         where: { id: accountId },
         data: { balance: { decrement: amount }, updatedAt: new Date() }
      });
   } else if(type === 'transfer') {
      // Update the source account balance
      await prisma.liquidityAccount.update({
         where: { id: accountId },
         data: { balance: { decrement: amount }, updatedAt: new Date() }
      });

      if(destinationAccountId) {
         // Update the destination account balance
         await prisma.liquidityAccount.update({
            where: { id: destinationAccountId },
            data: { balance: { increment: amount }, updatedAt: new Date() }
         });
      }
   }
   
   
}