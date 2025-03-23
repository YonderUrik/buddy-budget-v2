"use client";

import { useState } from "react";
import { AlertTriangle, Trash2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
   AlertDialog,
   AlertDialogCancel,
   AlertDialogContent,
   AlertDialogFooter,
   AlertDialogHeader,
   AlertDialogTitle,
   AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import axios from 'axios';

interface DeleteAccountProps {
   userEmail: string;
}

export function DeleteAccount({ userEmail }: DeleteAccountProps) {
   const [isDialogOpen, setIsDialogOpen] = useState(false);
   const [confirmValue, setConfirmValue] = useState("");
   const [isDeleting, setIsDeleting] = useState(false);

   const isConfirmValid = confirmValue === userEmail;

   const handleDeleteAccount = async () => {
      if (!isConfirmValid) return;

      setIsDeleting(true);
      try {
         const { data } = await axios.delete('/api/settings/account/delete');

         toast.success("Il tuo account è stato eliminato");
         setIsDialogOpen(false);

         // Redirect to homepage
         if (data.redirectUrl) {
            window.location.href = data.redirectUrl;
         }
      } catch (error: unknown) {
         const errorMessage = (error as { error?: string; message?: string })?.error || (error as Error).message || 'Si è verificato un errore';
         toast.error(errorMessage);
      } finally {
         setIsDeleting(false);
      }
   };

   return (
      <div className="space-y-4">
         <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
               <h3 className="text-base font-medium text-destructive">Elimina Account</h3>
               <p className="text-sm text-muted-foreground mt-1">
                  Elimina permanentemente il tuo account e tutti i dati associati.
               </p>
            </div>

            <AlertDialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
               <AlertDialogTrigger asChild>
                  <Button variant="destructive" size="sm">
                     <Trash2 className="h-4 w-4 mr-2" />
                     Elimina Account
                  </Button>
               </AlertDialogTrigger>
               <AlertDialogContent>
                  <AlertDialogHeader>
                     <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Eliminazione permanente account
                     </AlertDialogTitle>
                     <p>
                        Questa azione <strong>eliminerà permanentemente</strong> il tuo account e tutti i dati associati.
                     </p>
                     <div className="border border-destructive/20 rounded p-3 bg-destructive/5 text-sm mt-4">
                        <div className="font-medium mb-1">Questa azione non può essere annullata. Saranno eliminati:</div>
                        <div className="grid gap-1">
                           <div className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Tutte le transazioni e movimenti finanziari</span>
                           </div>
                           <div className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Tutti i conti e la liquidità registrata</span>
                           </div>
                           <div className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Tutti i budget e le categorie</span>
                           </div>
                           <div className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Tutti gli investimenti e analisi</span>
                           </div>
                           <div className="flex items-start">
                              <span className="mr-2">•</span>
                              <span>Tutte le impostazioni e preferenze</span>
                           </div>
                        </div>
                     </div>

                     <div className="pt-4">
                        <Label htmlFor="confirm-email" className="text-sm font-medium">
                           Per confermare, digita : <span className="font-bold">{userEmail}</span>
                        </Label>
                        <Input
                           id="confirm-email"
                           type="email"
                           value={confirmValue}
                           onChange={(e) => setConfirmValue(e.target.value)}
                           placeholder="Inserisci la tua email"
                           className="mt-2"
                        />
                     </div>
                  </AlertDialogHeader>
                  <AlertDialogFooter className="mt-4">
                     <AlertDialogCancel disabled={isDeleting}>Annulla</AlertDialogCancel>
                     <Button
                        variant="destructive"
                        disabled={!isConfirmValid || isDeleting}
                        onClick={handleDeleteAccount}
                        className="gap-2"
                     >
                        {isDeleting ? (
                           <>
                              <Loader2 className="h-4 w-4 animate-spin" />
                              Eliminando...
                           </>
                        ) : (
                           <>
                              <Trash2 className="h-4 w-4" />
                              Elimina definitivamente
                           </>
                        )}
                     </Button>
                  </AlertDialogFooter>
               </AlertDialogContent>
            </AlertDialog>
         </div>
      </div>
   );
} 