"use client";

import { useState } from "react";
// @ts-expect-error - Work around linter error with react-hook-form in TypeScript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Save } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from 'axios';

export const CURRENCY_OPTIONS = [
   { label: "Euro (€)", value: "EUR" },
   { label: "US Dollar ($)", value: "USD" },
   { label: "British Pound (£)", value: "GBP" },
   { label: "Japanese Yen (¥)", value: "JPY" },
   { label: "Canadian Dollar ($)", value: "CAD" },
   { label: "Swiss Franc (CHF)", value: "CHF" },
];

const personalInfoSchema = z.object({
   name: z.string().min(2, { message: "Il nome deve contenere almeno 2 caratteri" }),
   email: z.string().email({ message: "Inserisci un indirizzo email valido" }),
   primaryCurrency: z.string().min(1, { message: "Seleziona una valuta principale" }),
});

type PersonalInfoFormValues = z.infer<typeof personalInfoSchema>;

interface PersonalInfoFormProps {
   initialData: {
      name: string;
      email: string;
      primaryCurrency: string;
   };
}

export function PersonalInfoForm({ initialData }: PersonalInfoFormProps) {
   const [isSubmitting, setIsSubmitting] = useState(false);
   const router = useRouter();

   const form = useForm<PersonalInfoFormValues>({
      resolver: zodResolver(personalInfoSchema),
      defaultValues: initialData,
   });


   async function handleSubmit(values: PersonalInfoFormValues) {
      setIsSubmitting(true);
      try {
         await axios.put('/api/settings/profile', values);

         toast.success("Informazioni personali aggiornate con successo");
         router.refresh();
      } catch (error: unknown) {
         const errorMessage = (error as { error?: string; message?: string })?.error || (error as Error).message || 'Si è verificato un errore';
         toast.error(errorMessage);
      } finally {
         setIsSubmitting(false);
      }
   }

   return (
      <Form {...form}>
         <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <FormField
               control={form.control}
               name="name"
               render={({ field }: { field: object }) => (
                  <FormItem>
                     <FormLabel>Nome</FormLabel>
                     <FormControl>
                        <Input placeholder="Il tuo nome" {...field} />
                     </FormControl>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="email"
               render={({ field }: { field: object }) => (
                  <FormItem>
                     <FormLabel>Email</FormLabel>
                     <FormControl>
                        <Input placeholder="La tua email" {...field} disabled />
                     </FormControl>
                     <FormDescription>
                        L&apos;email è utilizzata per accedere al tuo account.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <FormField
               control={form.control}
               name="primaryCurrency"
               render={({ field }: { field: { onChange: (value: string) => void; value: string } }) => (
                  <FormItem>
                     <FormLabel>Valuta Principale</FormLabel>
                     <Select disabled onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                           <SelectTrigger>
                              <SelectValue placeholder="Seleziona una valuta" />
                           </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                           {CURRENCY_OPTIONS.map((currency) => (
                              <SelectItem key={currency.value} value={currency.value}>
                                 {currency.label}
                              </SelectItem>
                           ))}
                        </SelectContent>
                     </Select>
                     <FormDescription>
                        La valuta principale usata per le transazioni e report.
                     </FormDescription>
                     <FormMessage />
                  </FormItem>
               )}
            />

            <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto">
               {isSubmitting ? (
                  <>
                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                     Salvataggio...
                  </>
               ) : (
                  <>
                     <Save className="mr-2 h-4 w-4" />
                     Salva Modifiche
                  </>
               )}
            </Button>
         </form>
      </Form>
   );
}