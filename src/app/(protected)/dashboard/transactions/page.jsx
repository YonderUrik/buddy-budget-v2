'use client'

import { useTransactions } from "@/providers/transactions-provider";
import { useState } from "react";
import { createFormatters } from "@/lib/utils";

function TransactionList() {
   const { transactions, loading, error, fetchTransactions, addTransaction, updateTransaction, deleteTransaction } = useTransactions();
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [currentTransaction, setCurrentTransaction] = useState(null);
   
   const [isAdding, setIsAdding] = useState(false);
   const [isEditing, setIsEditing] = useState(false);
   const [isDeleting, setIsDeleting] = useState(false);

   const { formatCurrency } = createFormatters();

   console.log("transactions", transactions)
   return "TEST"
      
}

export default function DashboardTransactionsPage() {
   return (
      <div className="container mx-auto py-6 space-y-8">
         <h6 className="text-xl font-bold tracking-tight">Transazini</h6>
         <TransactionList />
      </div>
   );
}