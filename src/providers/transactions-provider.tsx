'use client';
import axios from "axios";
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

export type Transaction = {
   id: string;
   userId: string;
   accountId: string;
   date: Date;
   amount: number;
   currency: string;
   type: string;
   categoryId?: string;
   description?: string;
   isRecurring: boolean;
   recurringId?: string;
   budgetId?: string;
   tags: string[];
   createdAt: Date;
   updatedAt: Date;
   isDeleted: boolean;
   deletedAt?: Date;
}

type TransactionContextType = {
   transactions: Transaction[];
   loading: boolean;
   error: string | null;
   fetchTransactions: () => Promise<void>;
   addTransaction: (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>) => Promise<Transaction>;
   updateTransaction: (id: string, transaction: Partial<Transaction>) => Promise<Transaction>;
   deleteTransaction: (id: string) => Promise<void>;
}

const TransactionContext = createContext<TransactionContextType | undefined>(undefined);

type TransactionProviderProps = {
   children: ReactNode;
}

export function TransactionProvider({ children }: TransactionProviderProps) {
   const [transactions, setTransactions] = useState<Transaction[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState<string | null>(null);

   const fetchTransactions = async () => {
      try {
         const response = await axios.get('/api/transactions');
         const data = response.data;
         setTransactions(data);
         setError(null);
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error occurred');
         console.error('Error fetching transactions:', err);
      } finally {
         setLoading(false);
      }
   };

   const addTransaction = async (transaction: Omit<Transaction, 'id' | 'createdAt' | 'updatedAt' | 'isDeleted' | 'deletedAt'>) => {
      try {
         const response = await axios.post('/api/transactions', transaction);
         const newTransaction = response.data;
         setTransactions((prevTransactions) => [...prevTransactions, newTransaction]);
         return newTransaction;
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error occurred');
         console.error('Error adding transaction:', err);
         throw err;
      }
   };

   const updateTransaction = async (id: string, transaction: Partial<Transaction>) => {
      try {
         const response = await axios.patch(`/api/transactions/${id}`, transaction);
         const updatedTransaction = response.data;
         setTransactions((prevTransactions) =>
            prevTransactions.map((t) =>   
               t.id === id ? updatedTransaction : t
            )
         );
         return updatedTransaction;
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error occurred');
         console.error('Error updating transaction:', err);
         throw err;
      }
   };

   const deleteTransaction = async (id: string) => {
      try {
         await axios.delete(`/api/transactions/${id}`);
         setTransactions((prevTransactions) =>
            prevTransactions.filter((t) => t.id !== id)
         );
      } catch (err) {
         setError(err instanceof Error ? err.message : 'Unknown error occurred');
         console.error('Error deleting transaction:', err);
         throw err;
      }
   };

   useEffect(() => {
      fetchTransactions();
   }, []);

   const value = {
      transactions,
      loading,
      error,
      fetchTransactions,
      addTransaction,
      updateTransaction,
      deleteTransaction,
   };

   return (
      <TransactionContext.Provider value={value}>
         {children}
      </TransactionContext.Provider>
   );
}

export function useTransactions() {
   const context = useContext(TransactionContext);
   if (context === undefined) {
      throw new Error('useTransactions must be used within a TransactionProvider');
   }
   return context;
}