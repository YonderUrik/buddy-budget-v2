'use client';

import { useState, useEffect } from 'react';
import { useLiquidityAccounts } from '@/providers/liquidity-accounts-provider';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { PlusCircle, Edit, Trash2, Save, X, MoreHorizontal, RefreshCw, CreditCard, PiggyBank, Wallet, Landmark, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from "@/lib/utils";
import { createFormatters } from "@/lib/utils";
import { useSession } from "next-auth/react";

// Account Form Component
function AccountForm({ onSubmit, initialData, formType = 'add', isEditing, isAdding }) {
   const [formData, setFormData] = useState({
      name: initialData?.name || '',
      type: initialData?.type || 'checking',
      balance: initialData?.balance?.toString() || '0',
      isActive: initialData?.isActive ?? true,
   });

   const [isFocused, setIsFocused] = useState(null);
   const [isValid, setIsValid] = useState({
      name: true,
      balance: true,
   });

   useEffect(() => {
      setIsValid({
         name: formData.name.length > 0,
         balance: parseFloat(formData.balance) >= 0,
      });
   }, [formData.name, formData.balance]);

   const handleChange = (e) => {
      const { name, value, type, checked } = e.target;
      setFormData({
         ...formData,
         [name]: type === 'checkbox' ? checked : value,
      });
   };

   const handleSelectChange = (value) => {
      setFormData({
         ...formData,
         type: value,
      });
   };

   const handleSubmit = (e) => {
      e.preventDefault();
      onSubmit({
         ...formData,
         balance: parseFloat(formData.balance),
      });
   };

   // Get account type icon
   const getAccountTypeIcon = (type) => {
      switch (type) {
         case "checking":
            return <CreditCard className="h-5 w-5" />;
         case "savings":
            return <PiggyBank className="h-5 w-5" />;
         case "cash":
            return <Wallet className="h-5 w-5" />;
         case "other":
            return <Landmark className="h-5 w-5" />;
         default:
            return <CreditCard className="h-5 w-5" />;
      }
   };

   // Get account type label in Italian
   const getAccountTypeLabel = (type) => {
      switch (type) {
         case "checking":
            return "Conto Corrente";
         case "savings":
            return "Conto Risparmio";
         case "cash":
            return "Contanti";
         case "other":
            return "Altro";
         default:
            return "Conto";
      }
   };

   return (
      <Card className={cn(
         "transition-all duration-200",
         "hover:shadow-md"
      )}>
         <CardContent className="space-y-4 pt-4">
            <div className="space-y-2">
               <Label htmlFor="name" className="flex items-center justify-between">
                  <span>Nome del Conto</span>
                  {isFocused === 'name' && (
                     <span className="text-xs font-normal text-muted-foreground">
                        {formData.name.length ? `${formData.name.length} caratteri` : 'Campo obbligatorio'}
                     </span>
                  )}
               </Label>
               <div className="relative">
                  <Input
                     id="name"
                     name="name"
                     placeholder="Es. Conto Corrente, Risparmi..."
                     value={formData.name}
                     onChange={handleChange}
                     onFocus={() => setIsFocused('name')}
                     onBlur={() => setIsFocused(null)}
                     className={cn(
                        "pr-8",
                        !isValid.name && "border-destructive focus-visible:ring-destructive"
                     )}
                     required
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     {!isValid.name && <AlertCircle className="h-4 w-4 text-destructive" />}
                     {isValid.name && formData.name.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
               </div>
               {!isValid.name && (
                  <p className="text-xs text-destructive">Il nome del conto è obbligatorio</p>
               )}
            </div>

            <div className="space-y-2">
               <Label htmlFor="type">Tipo di Conto</Label>
               <Select
                  name="type"
                  value={formData.type}
                  onValueChange={handleSelectChange}
                  onOpenChange={() => setIsFocused('type')}
                  onBlur={() => setIsFocused(null)}
                  required
               >
                  <SelectTrigger className="flex items-center">
                     <SelectValue placeholder="Seleziona un tipo">
                        <div className="flex items-center gap-2">
                           <div className="p-1 rounded-full text-white">
                              {getAccountTypeIcon(formData.type)}
                           </div>
                           <span>{getAccountTypeLabel(formData.type)}</span>
                        </div>
                     </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                     <SelectItem value="checking">
                        <div className="flex items-center gap-2">
                           <div className="p-1 rounded-full text-white">
                              <CreditCard className="h-4 w-4" />
                           </div>
                           <span>Conto Corrente</span>
                        </div>
                     </SelectItem>
                     <SelectItem value="savings">
                        <div className="flex items-center gap-2">
                           <div className="p-1 rounded-full text-white">
                              <PiggyBank className="h-4 w-4" />
                           </div>
                           <span>Conto Risparmio</span>
                        </div>
                     </SelectItem>
                     <SelectItem value="cash">
                        <div className="flex items-center gap-2">
                           <div className="p-1 rounded-full text-white">
                              <Wallet className="h-4 w-4" />
                           </div>
                           <span>Contanti</span>
                        </div>
                     </SelectItem>
                     <SelectItem value="other">
                        <div className="flex items-center gap-2">
                           <div className="p-1 rounded-full text-white">
                              <Landmark className="h-4 w-4" />
                           </div>
                           <span>Altro</span>
                        </div>
                     </SelectItem>
                  </SelectContent>
               </Select>
            </div>

            <div className="space-y-2">
               <Label htmlFor="balance" className="flex items-center justify-between">
                  <span>Saldo Attuale</span>
                  {isFocused === 'balance' && (
                     <span className="text-xs font-normal text-muted-foreground">
                        Importo in EUR
                     </span>
                  )}
               </Label>
               <div className="relative">
                  <Input
                     id="balance"
                     name="balance"
                     type="number"
                     min="0"
                     step="0.01"
                     value={formData.balance}
                     onChange={handleChange}
                     onFocus={() => setIsFocused('balance')}
                     onBlur={() => setIsFocused(null)}
                     className={cn(
                        "pl-8 pr-8",
                        !isValid.balance && "border-destructive focus-visible:ring-destructive"
                     )}
                     required
                  />
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
                     €
                  </div>
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                     {!isValid.balance && <AlertCircle className="h-4 w-4 text-destructive" />}
                     {isValid.balance && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
               </div>
               {!isValid.balance && (
                  <p className="text-xs text-destructive">Il saldo deve essere maggiore o uguale a 0</p>
               )}
            </div>

            <div className="flex items-center space-x-2">
               <input
                  id="isActive"
                  name="isActive"
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={handleChange}
                  className="rounded border-gray-300"
               />
               <Label htmlFor="isActive">Conto Attivo</Label>
            </div>

            <DialogFooter>
               <Button type="button" variant="outline" onClick={() => onSubmit(null)}>
                  Annulla
               </Button>
               <Button type="submit" onClick={handleSubmit} disabled={!isValid.name || !isValid.balance || isEditing || isAdding}>
                  {formType === 'add' ? (isAdding ? (
                     <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aggiungendo...
                     </>
                  ) : 'Aggiungi Conto') : (isEditing ? (
                     <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Aggiornando...
                     </>
                  ) : 'Aggiorna Conto')}
               </Button>
            </DialogFooter>
         </CardContent>
      </Card >
   );
}

// Delete Confirmation Component
function DeleteConfirmation({ accountId, accountName, onConfirm, onCancel, isLoading }) {
   return (
      <div className="space-y-4">
         <p>Sei sicuro di voler eliminare il conto "{accountName}"?</p>
         <p className="text-sm text-destructive">Questa azione non può essere annullata e eliminerà tutte le transazioni e i dati storici associati a questo conto.</p>

         <DialogFooter>
            <Button variant="outline" onClick={onCancel}>
               Annulla
            </Button>
            <Button variant="destructive" onClick={() => onConfirm(accountId)} disabled={isLoading}>
               {isLoading ? <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Eliminando...
               </> : <>
                  <Trash2 className="h-4 w-4" />
                  Elimina definitivamente
               </>}
            </Button>
         </DialogFooter>
      </div>
   );
}

// Account List Component
function AccountList() {
   const { accounts, loading, error, addAccount, updateAccount, deleteAccount, fetchAccounts } = useLiquidityAccounts();
   const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
   const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
   const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
   const [currentAccount, setCurrentAccount] = useState(null);
   const { data: session } = useSession()

   const [isAdding, setIsadding] = useState(false)
   const [isEditing, setIsEditing] = useState(false)
   const [isDeleting, setIsDeleting] = useState(false)

   const { formatCurrency } = createFormatters()

   const userCurrency = session?.user?.primaryCurrency || 'EUR'

   const handleAddAccount = async (accountData) => {
      if (!accountData) {
         setIsAddDialogOpen(false);
         return;
      }

      try {
         setIsadding(true)
         // Create basic account data
         await addAccount(accountData);

         toast.success("Conto aggiunto", {
            description: "Il tuo conto è stato creato con successo"
         });

         setIsAddDialogOpen(false);
      } catch (err) {
         toast.error("Errore", {
            description: "Impossibile aggiungere il conto"
         });
         console.error("Failed to add account:", err);
      } finally {
         setIsadding(false)
      }
   };

   const handleUpdateAccount = async (accountData) => {
      if (!accountData || !currentAccount) {
         setIsEditDialogOpen(false);
         return;
      }

      try {
         setIsEditing(true)
         await updateAccount(currentAccount.id, accountData);

         toast.success("Conto aggiornato", {
            description: "Il tuo conto è stato aggiornato con successo"
         });

         setIsEditDialogOpen(false);
      } catch (err) {
         toast.error("Errore", {
            description: "Impossibile aggiornare il conto"
         });
         console.error("Failed to update account:", err);
      } finally {
         setIsEditing(false)
      }
   };

   const handleDeleteAccount = async (accountId) => {
      try {
         setIsDeleting(true)
         await deleteAccount(accountId);

         toast.success("Conto eliminato", {
            description: "Il tuo conto è stato eliminato con successo"
         });

         setIsDeleteDialogOpen(false);
      } catch (err) {
         toast.error("Errore", {
            description: "Impossibile eliminare il conto"
         });
         console.error("Failed to delete account:", err);
      } finally {
         setIsDeleting(false)
      }
   };

   const openEditDialog = (account) => {
      setCurrentAccount(account);
      setIsEditDialogOpen(true);
   };

   const openDeleteDialog = (account) => {
      setCurrentAccount(account);
      setIsDeleteDialogOpen(true);
   };

   // Get account type icon
   const getAccountTypeIcon = (type) => {
      switch (type) {
         case "checking":
            return <CreditCard className="h-5 w-5" />;
         case "savings":
            return <PiggyBank className="h-5 w-5" />;
         case "cash":
            return <Wallet className="h-5 w-5" />;
         case "other":
            return <Landmark className="h-5 w-5" />;
         default:
            return <CreditCard className="h-5 w-5" />;
      }
   };

   // Get account type label in Italian
   const getAccountTypeLabel = (type) => {
      switch (type) {
         case "checking":
            return "Conto Corrente";
         case "savings":
            return "Conto Risparmio";
         case "cash":
            return "Contanti";
         case "other":
            return "Altro";
         default:
            return "Conto";
      }
   };

   if (loading) {
      return (
         <div className="flex justify-center items-center min-h-[400px]">
            <div className="flex flex-col items-center gap-2">
               <RefreshCw className="animate-spin h-8 w-8 text-primary" />
               <p>Caricamento dei tuoi conti...</p>
            </div>
         </div>
      );
   }

   if (error) {
      return (
         <Card className="border-destructive">
            <CardHeader>
               <CardTitle className="text-destructive">Errore</CardTitle>
            </CardHeader>
            <CardContent>
               <p>{error}</p>
               <Button
                  variant="outline"
                  className="mt-4"
                  onClick={fetchAccounts}
               >
                  Riprova
               </Button>
            </CardContent>
         </Card>
      );
   }

   const activeAccounts = accounts.filter(account => !account.isDeleted);

   return (
      <div className="space-y-6">
         {/* Summary Card */}
         <div className="flex justify-between">
            <Button variant="outline" onClick={fetchAccounts}>
               <RefreshCw className="mr-2 h-4 w-4" />
               Aggiorna
            </Button>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
               <DialogTrigger asChild>
                  <Button>
                     <PlusCircle className="mr-2 h-4 w-4" />
                     Aggiungi Nuovo Conto
                  </Button>
               </DialogTrigger>
               <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                     <DialogTitle>Aggiungi Nuovo Conto</DialogTitle>
                     <DialogDescription>
                        Crea un nuovo conto di liquidità per tracciare le tue finanze.
                     </DialogDescription>
                  </DialogHeader>
                  <AccountForm isAdding={isAdding} onSubmit={handleAddAccount} formType="add" />
               </DialogContent>
            </Dialog>
         </div>

         {/* Accounts Table */}
         <Card>
            <CardHeader>
               <CardTitle>I Tuoi Conti</CardTitle>
            </CardHeader>
            <CardContent>
               {activeAccounts.length === 0 ? (
                  <div className="text-center py-8">
                     <p className="text-muted-foreground">Non hai ancora nessun conto.</p>
                     <Button
                        variant="outline"
                        className="mt-4"
                        onClick={() => setIsAddDialogOpen(true)}
                     >
                        <PlusCircle className="mr-2 h-4 w-4" />
                        Aggiungi Il Tuo Primo Conto
                     </Button>
                  </div>
               ) : (
                  <Table>
                     <TableHeader>
                        <TableRow>
                           <TableHead>Nome</TableHead>
                           <TableHead>Tipo</TableHead>
                           <TableHead>Saldo</TableHead>
                           <TableHead>Stato</TableHead>
                           <TableHead className="text-right">Azioni</TableHead>
                        </TableRow>
                     </TableHeader>
                     <TableBody>
                        {activeAccounts.map((account) => (
                           <TableRow key={account.id}>
                              <TableCell className="font-medium">{account.name}</TableCell>
                              <TableCell>
                                 <div className="flex items-center gap-2">
                                    {getAccountTypeIcon(account.type)}
                                    <span>{getAccountTypeLabel(account.type)}</span>
                                 </div>
                              </TableCell>
                              <TableCell>{formatCurrency(account.balance.toFixed(2), userCurrency)}</TableCell>
                              <TableCell>
                                 {account.isActive ? (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                       Attivo
                                    </span>
                                 ) : (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                                       Inattivo
                                    </span>
                                 )}
                              </TableCell>
                              <TableCell className="text-right">
                                 <div className="flex justify-end gap-2">
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => openEditDialog(account)}
                                    >
                                       <Edit className="h-4 w-4" />
                                    </Button>
                                    <Button
                                       variant="ghost"
                                       size="sm"
                                       onClick={() => openDeleteDialog(account)}
                                    >
                                       <Trash2 className="h-4 w-4" />
                                    </Button>
                                 </div>
                              </TableCell>
                           </TableRow>
                        ))}
                     </TableBody>
                  </Table>
               )}
            </CardContent>
         </Card>

         {/* Edit Dialog */}
         <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="sm:max-w-[500px]">
               <DialogHeader>
                  <DialogTitle>Modifica Conto</DialogTitle>
                  <DialogDescription>
                     Apporta modifiche ai dettagli del tuo conto.
                  </DialogDescription>
               </DialogHeader>
               {currentAccount && (
                  <AccountForm
                     onSubmit={handleUpdateAccount}
                     initialData={currentAccount}
                     formType="edit"
                     isEditing={isEditing}
                  />
               )}
            </DialogContent>
         </Dialog>

         {/* Delete Dialog */}
         <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
            <DialogContent>
               <DialogHeader>
                  <DialogTitle>Elimina Conto</DialogTitle>
                  <DialogDescription>
                     Questo eliminerà definitivamente il tuo conto.
                  </DialogDescription>
               </DialogHeader>
               {currentAccount && (
                  <DeleteConfirmation
                     accountId={currentAccount.id}
                     accountName={currentAccount.name}
                     onConfirm={handleDeleteAccount}
                     onCancel={() => setIsDeleteDialogOpen(false)}
                     isLoading={isDeleting}
                  />
               )}
            </DialogContent>
         </Dialog>
      </div>
   );
}

// Main Page Component
export default function DashboardLiquidityAccountsPage() {
   return (
      <div className="container mx-auto py-6 space-y-8">
         <h6 className="text-xl font-bold tracking-tight">Conti</h6>
         <AccountList />
      </div>
   );
}