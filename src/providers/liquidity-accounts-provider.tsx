'use client';
import { createContext, useContext, useState, useEffect, ReactNode } from "react";

// Define the type for a liquidity account based on Prisma schema
export type LiquidityAccount = {
  id: string;
  userId: string;
  name: string;
  type: "checking" | "savings" | "cash" | "other";
  balance: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  isDeleted: boolean;
  deletedAt?: Date;
};

// Define context type with data and operations
type LiquidityAccountContextType = {
  accounts: LiquidityAccount[];
  loading: boolean;
  error: string | null;
  fetchAccounts: () => Promise<void>;
  addAccount: (account: Omit<LiquidityAccount, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">) => Promise<LiquidityAccount>;
  updateAccount: (id: string, accountData: Partial<LiquidityAccount>) => Promise<LiquidityAccount>;
  deleteAccount: (id: string) => Promise<void>;
};

// Create the context
const LiquidityAccountContext = createContext<LiquidityAccountContextType | undefined>(undefined);

// Provider component props
type LiquidityAccountProviderProps = {
  children: ReactNode;
};

export function LiquidityAccountProvider({ children }: LiquidityAccountProviderProps) {
  const [accounts, setAccounts] = useState<LiquidityAccount[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Fetch accounts data
  const fetchAccounts = async () => {
    try {
      setLoading(true);
      // Replace this with your actual API call
      const response = await fetch('/api/liquidity-accounts');
      if (!response.ok) {
        throw new Error('Failed to fetch liquidity accounts');
      }
      const data = await response.json();
      setAccounts(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error fetching liquidity accounts:', err);
    } finally {
      setLoading(false);
    }
  };

  // Add a new account
  const addAccount = async (account: Omit<LiquidityAccount, "id" | "createdAt" | "updatedAt" | "isDeleted" | "deletedAt">) => {
    try {
      const response = await fetch('/api/liquidity-accounts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(account),
      });

      if (!response.ok) {
        throw new Error('Failed to add liquidity account');
      }

      const newAccount = await response.json();
      setAccounts((prevAccounts) => [...prevAccounts, newAccount]);
      return newAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error adding liquidity account:', err);
      throw err;
    }
  };

  // Update an existing account
  const updateAccount = async (id: string, accountData: Partial<LiquidityAccount>) => {
    try {
      const response = await fetch(`/api/liquidity-accounts/${id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(accountData),
      });

      if (!response.ok) {
        throw new Error('Failed to update liquidity account');
      }

      const updatedAccount = await response.json();
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) => 
          account.id === id ? updatedAccount : account
        )
      );
      return updatedAccount;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error updating liquidity account:', err);
      throw err;
    }
  };

  // Delete an account (soft delete)
  const deleteAccount = async (id: string) => {
    try {
      const response = await fetch(`/api/liquidity-accounts/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete liquidity account');
      }

      // After successful delete, update local state
      setAccounts((prevAccounts) =>
        prevAccounts.map((account) =>
          account.id === id 
            ? { ...account, isDeleted: true, deletedAt: new Date() } 
            : account
        )
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
      console.error('Error deleting liquidity account:', err);
      throw err;
    }
  };

  // Fetch accounts on initial load
  useEffect(() => {
    fetchAccounts();
  }, []);

  // Context value
  const value = {
    accounts,
    loading,
    error,
    fetchAccounts,
    addAccount,
    updateAccount,
    deleteAccount,
  };

  return (
    <LiquidityAccountContext.Provider value={value}>
      {children}
    </LiquidityAccountContext.Provider>
  );
}

// Custom hook for using the LiquidityAccount context
export function useLiquidityAccounts() {
  const context = useContext(LiquidityAccountContext);
  if (context === undefined) {
    throw new Error('useLiquidityAccounts must be used within a LiquidityAccountProvider');
  }
  return context;
}