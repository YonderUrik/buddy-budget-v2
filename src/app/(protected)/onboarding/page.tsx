"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-expect-error - Work around linter error with react-hook-form in TypeScript
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import * as LucideIcons from "lucide-react";
import axios from 'axios';

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DefaultCategories, defaultCategories } from "@/components/onboarding/default-categories";
import { CategoryForm } from "@/components/onboarding/category-form";
import { AccountForm } from "@/components/onboarding/account-form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";

import {
  ArrowRight,
  ArrowLeft,
  Check,
  CreditCard,
  Wallet,
  Landmark,
  PiggyBank,
  DollarSign,
  Euro,
  PoundSterling,
  Plus,
  ArrowDown,
  ArrowUp,
  BadgeCheck,
  Settings,
  BarChart3
} from "lucide-react";
import { createFormatters } from "@/lib/utils";
import { CURRENCY_OPTIONS } from "@/components/settings/personal-info-form";

// Schema di validazione per il form di onboarding
const onboardingSchema = z.object({
  language: z.enum(["it", "en", "es", "fr", "de"], {
    required_error: "Seleziona una lingua",
  }),
  primaryCurrency: z.string({
    required_error: "Seleziona una valuta principale",
  }),
  liquidityAccounts: z.array(
    z.object({
      name: z.string().min(1, "Il nome è obbligatorio"),
      type: z.enum(["checking", "savings", "cash", "other"], {
        required_error: "Seleziona un tipo di conto",
      }),
      balance: z.coerce.number().min(0, "Il saldo deve essere maggiore o uguale a 0"),
    })
  ).min(1, "Aggiungi almeno un conto"),
  categories: z.array(
    z.object({
      name: z.string().min(1, "Il nome è obbligatorio"),
      type: z.enum(["income", "expense"], {
        required_error: "Seleziona un tipo di categoria",
      }),
      icon: z.string().optional(),
      color: z.string().optional(),
      subcategories: z.array(
        z.object({
          name: z.string().min(1, "Il nome è obbligatorio"),
        })
      ).optional(),
    })
  ).optional(),
});

// Convert kebab-case to PascalCase for Lucide icon names
function toPascalCase(str: string) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// Componente principale della pagina di onboarding
export default function OnboardingPage() {
  const router = useRouter();
  const { update } = useSession();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [useDefaultCategories, setUseDefaultCategories] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);

  // Stati per tenere traccia degli account e delle categorie
  const [accounts, setAccounts] = useState<{ name: string; type: "checking" | "savings" | "cash" | "other"; balance: number }[]>([
    { name: "", type: "checking", balance: 0 }
  ]);
  const [categories, setCategories] = useState<{ name: string; type: "income" | "expense"; icon?: string; color?: string; subcategories?: { name: string }[] }[]>([]);

  // Inizializza il form con valori predefiniti
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      language: "it",
      primaryCurrency: "EUR",
      liquidityAccounts: [
        { name: "", type: "checking", balance: 0 }
      ],
      categories: [],
    },
  });

  // Sincronizza lo stato degli account con il form
  useEffect(() => {
    form.setValue("liquidityAccounts", accounts);
  }, [accounts, form]);

  // Sincronizza lo stato delle categorie con il form
  useEffect(() => {
    if (!useDefaultCategories) {
      form.setValue("categories", categories);
    }
  }, [categories, form, useDefaultCategories]);

  // Funzione per aggiungere un nuovo conto di liquidità
  const addLiquidityAccount = () => {
    setAccounts([
      ...accounts,
      { name: "", type: "checking", balance: 0 }
    ]);
  };

  // Funzione per rimuovere un conto di liquidità
  const removeLiquidityAccount = (index: number) => {
    if (accounts.length > 1) {
      setAccounts(accounts.filter((_, i) => i !== index));
    } else {
      toast.error("Devi avere almeno un conto");
    }
  };

  // Funzione per aggiungere una nuova categoria
  const addCategory = (type: "income" | "expense") => {
    if (useDefaultCategories) {
      setUseDefaultCategories(false);
      setCategories([]);
    }

    const color = type === "income" ? "#4CAF50" : "#F44336"; // Verde per income, rosso per expense
    setCategories([
      ...categories,
      {
        name: "",
        type,
        icon: type === "income" ? "trending-up" : "shopping-bag",
        color,
        subcategories: []
      }
    ]);
  };

  // Funzione per rimuovere una categoria
  const removeCategory = (index: number) => {
    if (categories.length > 0) {
      setCategories(categories.filter((_, i) => i !== index));
    }
  };

  // Funzione per aggiungere una sottocategoria
  const addSubcategory = (parentIndex: number) => {
    if (categories[parentIndex]) {
      const updatedCategories = [...categories];
      const subcategories = updatedCategories[parentIndex].subcategories || [];
      updatedCategories[parentIndex].subcategories = [...subcategories, { name: "" }];
      setCategories(updatedCategories);
    }
  };

  // Funzione per rimuovere una sottocategoria
  const removeSubcategory = (parentIndex: number, subIndex: number) => {
    if (categories[parentIndex]?.subcategories) {
      const updatedCategories = [...categories];
      updatedCategories[parentIndex].subcategories = updatedCategories[parentIndex].subcategories?.filter(
        (_, i) => i !== subIndex
      );
      setCategories(updatedCategories);
    }
  };

  // Funzione per aggiornare un campo specifico di un account
  const updateAccount = (index: number, field: string, value: string) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setAccounts(updatedAccounts);
  };

  // Funzione per aggiornare un campo specifico di una categoria
  const updateCategory = (index: number, field: string, value: string) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setCategories(updatedCategories);
  };

  // Funzione per gestire l'invio del form
  const onSubmit = async () => {
    // Instead of submitting immediately, show the confirmation dialog
    setShowConfirmDialog(true);
  };


  // Function to handle the actual submission after confirmation
  const handleConfirmedSubmit = async () => {
    setIsSubmitting(true);
    setShowConfirmDialog(false);

    try {
      // Get the form values and properly handle categories
      const formValues = form.getValues();
      const formData = {
        ...formValues,
        // Send default categories if useDefaultCategories is true, otherwise use the custom categories
        categories: useDefaultCategories ? defaultCategories : formValues.categories
      };

      const response = await axios.post("/api/user/onboarding", formData);

      // Check for response status
      if (response.status !== 200) {
        throw new Error(response.data.message || "Si è verificato un errore durante l'onboarding");
      }

      // Aggiorna la sessione per riflettere che l'onboarding è stato completato
      await update({ hasCompletedOnboarding: true });

      toast.success("Onboarding completato con successo!");
      router.push("/dashboard");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante l'onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  const { formatCurrency } = createFormatters()

  // Array di passi dell'onboarding
  const steps = [
    {
      title: "Preferenze",
      description: "Imposta le tue preferenze di base",
      content: (
        <div className="space-y-6">
          <FormField
            control={form.control}
            name="language"
            render={({ field }: { field: { onChange: (value: string) => void; value: string } }) => (
              <FormItem>
                <FormLabel>Lingua</FormLabel>
                <FormDescription>
                  Scegli la lingua dell&apos;interfaccia
                </FormDescription>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una lingua" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="it">Italiano</SelectItem>
                  </SelectContent>
                </Select>
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
                <FormDescription>
                  Scegli la valuta principale per i tuoi conti
                </FormDescription>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona una valuta" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {CURRENCY_OPTIONS.map((currency) => (
                      <SelectItem key={currency.value} value={currency.value}>
                        <div className="flex items-center">
                          <Euro className="mr-2 h-4 w-4" />
                          <span>{currency.label}</span>
                        </div>
                      </SelectItem>

                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      ),
    },
    {
      title: "Conti di Liquidità",
      description: "Aggiungi i tuoi conti bancari e contanti",
      content: (
        <div className="space-y-6">
          <div className="flex justify-between items-center mb-2">
            <FormLabel className="text-lg font-semibold">I tuoi Conti</FormLabel>
            <Button
              type="button"
              variant="outline"
              onClick={addLiquidityAccount}
              className="flex items-center gap-2 bg-primary/10 hover:bg-primary/20 transition-colors"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Conto
            </Button>
          </div>

          <FormDescription className="text-sm text-muted-foreground mb-4">
            Aggiungi i tuoi conti bancari, risparmi e contanti per monitorare il tuo patrimonio liquidità
          </FormDescription>

          {accounts.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg bg-muted/20">
              <Wallet className="h-12 w-12 text-muted-foreground mb-3 opacity-50" />
              <p className="text-center text-muted-foreground mb-4">Non hai ancora aggiunto nessun conto</p>
              <Button onClick={addLiquidityAccount} variant="default" size="sm">
                <Plus className="h-4 w-4 mr-2" /> Aggiungi il tuo primo conto
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((account, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2, delay: index * 0.05 }}
                >
                  <AccountForm
                    key={index}
                    form={form}
                    index={index}
                    account={account}
                    removeAccount={removeLiquidityAccount}
                    currency={form.getValues("primaryCurrency")}
                    updateAccount={(field, value) => updateAccount(index, field, value)}
                  />
                </motion.div>
              ))}
            </div>
          )}

          {accounts.length > 0 && (
            <div className="mt-4 p-4 bg-muted/30 rounded-md flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-sm font-medium">Bilancio Totale</p>
                  <p className="text-xs text-muted-foreground">Somma di tutti i tuoi conti</p>
                </div>
              </div>
              <p className="text-lg font-semibold">
                {formatCurrency(accounts.reduce((sum, account) => sum + (account.balance || 0), 0), form.getValues("primaryCurrency"))}
              </p>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Categorie",
      description: "Imposta le tue categorie di entrate e uscite",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-lg font-semibold">Le tue Categorie</FormLabel>
            </div>

            <div className="p-3 mt-2 mb-2 border rounded-md bg-muted/20">
              <div className="flex items-center gap-3">
                <div className="relative inline-flex items-center">
                  <input
                    type="checkbox"
                    id="useDefaultCategories"
                    checked={useDefaultCategories}
                    onChange={(e) => {
                      setUseDefaultCategories(e.target.checked);
                      if (e.target.checked) {
                        setCategories([]);
                      }
                    }}
                    className="peer h-4 w-4 shrink-0 rounded-sm border border-primary ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground"
                  />
                  <label htmlFor="useDefaultCategories" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ml-2">
                    Usa le categorie predefinite
                  </label>
                </div>
                <div className="flex-1">
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full">Consigliato</span>
                </div>
              </div>

              <p className="text-xs text-muted-foreground mt-2">
                {useDefaultCategories
                  ? "Utilizziamo un set completo di categorie comuni per entrate e uscite per aiutarti a iniziare velocemente."
                  : "Stai usando categorie personalizzate. Perderai le categorie predefinite."}
              </p>
            </div>
          </div>

          {useDefaultCategories ? (
            <motion.div
              className="mt-4 border rounded-md p-5 bg-muted/10"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
            >
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                Anteprima delle categorie predefinite:
              </h3>
              <div className="overflow-y-auto max-h-[350px] pr-2 custom-scrollbar">
                <DefaultCategories showSubcategories={true} />
              </div>
            </motion.div>
          ) : (
            <div className="space-y-4">
              {categories.length === 0 ? (
                <motion.div
                  className="text-center py-12 border-2 rounded-md border-dashed flex flex-col items-center justify-center"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.3 }}
                >
                  <div className="mb-4 p-3 rounded-full bg-muted/40">
                    <Plus className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <p className="text-muted-foreground mb-4">
                    Nessuna categoria personalizzata.
                    <br />
                    Crea categorie per organizzare le tue entrate e uscite.
                  </p>
                  <div className="flex space-x-3">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addCategory("income")}
                      className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                      size="sm"
                    >
                      <ArrowUp className="h-4 w-4" />
                      Aggiungi Entrata
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => addCategory("expense")}
                      className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                      size="sm"
                    >
                      <ArrowDown className="h-4 w-4" />
                      Aggiungi Spesa
                    </Button>
                  </div>
                </motion.div>
              ) : (
                <div>
                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-green-500"></div>
                      <h3 className="text-sm font-medium">Categorie di Entrata ({categories.filter(c => c.type === "income").length})</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addCategory("income")}
                      className="flex items-center gap-1 text-xs h-8 text-green-700"
                      size="sm"
                    >
                      <Plus className="h-3 w-3" />
                      Aggiungi
                    </Button>
                  </div>

                  {categories.filter(c => c.type === "income").length === 0 ? (
                    <div className="mb-6 text-center py-4 border rounded-md border-dashed text-sm text-muted-foreground">
                      Nessuna categoria di entrata. Aggiungine una.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                      {categories
                        .filter(c => c.type === "income")
                        .map((category, index) => {
                          const categoryIndex = categories.findIndex(c => c === category);
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <CategoryForm
                                index={categoryIndex}
                                category={category}
                                removeCategory={removeCategory}
                                addSubcategory={addSubcategory}
                                removeSubcategory={removeSubcategory}
                                updateCategory={(field, value) => updateCategory(categoryIndex, field, value)}
                              />
                            </motion.div>
                          );
                        })}
                    </div>
                  )}

                  <div className="mb-4 flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <div className="size-2 rounded-full bg-red-500"></div>
                      <h3 className="text-sm font-medium">Categorie di Spesa ({categories.filter(c => c.type === "expense").length})</h3>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => addCategory("expense")}
                      className="flex items-center gap-1 text-xs h-8 text-red-700"
                      size="sm"
                    >
                      <Plus className="h-3 w-3" />
                      Aggiungi
                    </Button>
                  </div>

                  {categories.filter(c => c.type === "expense").length === 0 ? (
                    <div className="text-center py-4 border rounded-md border-dashed text-sm text-muted-foreground">
                      Nessuna categoria di spesa. Aggiungine una.
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {categories
                        .filter(c => c.type === "expense")
                        .map((category, index) => {
                          const categoryIndex = categories.findIndex(c => c === category);
                          return (
                            <motion.div
                              key={index}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              transition={{ duration: 0.2, delay: index * 0.05 }}
                            >
                              <CategoryForm
                                index={categoryIndex}
                                category={category}
                                removeCategory={removeCategory}
                                addSubcategory={addSubcategory}
                                removeSubcategory={removeSubcategory}
                                updateCategory={(field, value) => updateCategory(categoryIndex, field, value)}
                              />
                            </motion.div>
                          );
                        })}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}

          {!useDefaultCategories && categories.length > 0 && (
            <div className="flex justify-end mt-6">
              <div className="flex items-center gap-2 text-sm">
                <span className="opacity-70">Totale: {categories.length} categorie, {categories.reduce((acc, cat) => acc + (cat.subcategories?.length || 0), 0)} sottocategorie</span>
              </div>
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Riepilogo",
      description: "Verifica e conferma le tue impostazioni",
      content: (
        <div className="space-y-6">
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-3">
              <BadgeCheck className="h-8 w-8 text-primary" />
            </div>
            <h3 className="text-xl font-semibold">Quasi fatto!</h3>
            <p className="text-muted-foreground">Rivedi le tue impostazioni prima di iniziare ad utilizzare Buddy Budget</p>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5 text-muted-foreground" />
                Preferenze
              </CardTitle>
              <CardDescription>Le tue preferenze di base</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Lingua</h4>
                  <p className="text-base">
                    {form.getValues("language") === "it" && "Italiano"}
                    {form.getValues("language") === "en" && "English"}
                    {form.getValues("language") === "es" && "Español"}
                    {form.getValues("language") === "fr" && "Français"}
                    {form.getValues("language") === "de" && "Deutsch"}
                  </p>
                </div>
                <div>
                  <h4 className="text-sm font-medium text-muted-foreground">Valuta Principale</h4>
                  <p className="text-base flex items-center">
                    {form.getValues("primaryCurrency") === "EUR" && <Euro className="mr-2 h-4 w-4" />}
                    {form.getValues("primaryCurrency") === "USD" && <DollarSign className="mr-2 h-4 w-4" />}
                    {form.getValues("primaryCurrency") === "GBP" && <PoundSterling className="mr-2 h-4 w-4" />}
                    {form.getValues("primaryCurrency")}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5 text-muted-foreground" />
                Conti di Liquidità
              </CardTitle>
              <CardDescription>I tuoi conti bancari e contanti</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accounts.map((account, index) => {
                  const getAccountTypeIcon = (type: string) => {
                    switch (type) {
                      case "checking": return <CreditCard className="h-5 w-5 text-primary" />;
                      case "savings": return <PiggyBank className="h-5 w-5 text-primary" />;
                      case "cash": return <Wallet className="h-5 w-5 text-primary" />;
                      case "other": return <Landmark className="h-5 w-5 text-primary" />;
                      default: return <CreditCard className="h-5 w-5 text-primary" />;
                    }
                  };

                  const getAccountTypeLabel = (type: string) => {
                    switch (type) {
                      case "checking": return "Conto Corrente";
                      case "savings": return "Conto Risparmio";
                      case "cash": return "Contanti";
                      case "other": return "Altro";
                      default: return "Conto";
                    }
                  };

                  return (
                    <div key={index} className="flex justify-between items-center p-3 border rounded-md hover:bg-muted/20 transition-colors">
                      <div className="flex items-center gap-3">
                        {getAccountTypeIcon(account.type)}
                        <div>
                          <p className="font-medium">{account.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {getAccountTypeLabel(account.type)}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">
                          {formatCurrency(account.balance, form.getValues("primaryCurrency"))}

                          {!["EUR", "USD", "GBP", "JPY", "CHF"].includes(form.getValues("primaryCurrency")) && form.getValues("primaryCurrency")}
                        </p>
                      </div>
                    </div>
                  );
                })}

                <div className="mt-2 p-3 bg-muted/20 rounded-md flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <p className="font-medium">Bilancio Totale</p>
                  </div>
                  <p className="font-semibold">
                    {formatCurrency(accounts.reduce((sum, account) => sum + (account.balance || 0), 0), form.getValues("primaryCurrency"))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-muted-foreground" />
                Categorie
              </CardTitle>
              <CardDescription>Le tue categorie di entrate e uscite</CardDescription>
            </CardHeader>
            <CardContent>
              {useDefaultCategories ? (
                <div className="p-3 border rounded-md bg-muted/10">
                  <div className="flex items-center gap-2 mb-2">
                    <BadgeCheck className="h-5 w-5 text-green-500" />
                    <p className="font-medium">Utilizzerai il set di categorie predefinite</p>
                  </div>
                  <p className="text-muted-foreground mb-4 text-sm">
                    Verranno create categorie predefinite ottimizzate per gestire al meglio le tue finanze personali
                  </p>
                  <div className="max-h-[200px] overflow-y-auto pr-2 custom-scrollbar">
                    <DefaultCategories compact={true} showSubcategories={false} />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {categories.length === 0 ? (
                    <div className="p-3 border rounded-md">
                      <p className="text-muted-foreground">
                        Nessuna categoria personalizzata.
                      </p>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-2 rounded-full bg-green-500"></div>
                        <h3 className="text-sm font-medium">Categorie di Entrata ({categories.filter(c => c.type === "income").length})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                        {categories
                          .filter(c => c.type === "income")
                          .map((category, index) => {
                            const IconComponent = category.icon
                              ? (LucideIcons as never)[toPascalCase(category.icon)] || LucideIcons.CircleDashed
                              : category.type === "income"
                                ? LucideIcons.TrendingUp
                                : LucideIcons.ShoppingBag;

                            return (
                              <Card key={index} className={`border-l-4 ${category.type === 'income' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardContent className="p-3 flex items-center gap-3">
                                  <div
                                    className="flex items-center justify-center h-8 w-8 rounded-full"
                                    style={{ backgroundColor: category.color || (category.type === "income" ? "#4CAF50" : "#F44336") }}
                                  >
                                    <IconComponent className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{category.name}</p>
                                    {category.subcategories && category.subcategories.length > 0 &&
                                      <p className="text-xs text-muted-foreground">
                                        {category.subcategories.length} sottocategorie
                                      </p>
                                    }
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>

                      <div className="flex items-center gap-2 mb-3">
                        <div className="size-2 rounded-full bg-red-500"></div>
                        <h3 className="text-sm font-medium">Categorie di Spesa ({categories.filter(c => c.type === "expense").length})</h3>
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {categories
                          .filter(c => c.type === "expense")
                          .map((category, index) => {
                            const IconComponent = category.icon
                              ? (LucideIcons as never)[toPascalCase(category.icon)] || LucideIcons.CircleDashed
                              : category.type === "income"
                                ? LucideIcons.TrendingUp
                                : LucideIcons.ShoppingBag;

                            return (
                              <Card key={index} className={`border-l-4 ${category.type === 'income' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                                <CardContent className="p-3 flex items-center gap-3">
                                  <div
                                    className="flex items-center justify-center h-8 w-8 rounded-full"
                                    style={{ backgroundColor: category.color || (category.type === "income" ? "#4CAF50" : "#F44336") }}
                                  >
                                    <IconComponent className="h-4 w-4 text-white" />
                                  </div>
                                  <div>
                                    <p className="font-medium">{category.name}</p>
                                    {category.subcategories && category.subcategories.length > 0 &&
                                      <p className="text-xs text-muted-foreground">
                                        {category.subcategories.length} sottocategorie
                                      </p>
                                    }
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="bg-muted/20 rounded-md p-4">
            <p className="text-sm text-center text-muted-foreground">
              Una volta completato l&apos;onboarding, potrai sempre modificare queste impostazioni dal tuo profilo.
              <br />
              Sei pronto per iniziare a gestire le tue finanze con Buddy Budget?
            </p>
          </div>
        </div>
      ),
    },
  ];

  // Funzioni per navigare tra i passi
  const nextStep = () => {
    const fields = [
      ["language", "primaryCurrency"],
      ["liquidityAccounts"],
      []
    ][step];

    const isValid = fields.length > 0 ? fields.every(field => {
      return form.trigger(field as keyof typeof form.control._defaultValues);
    }) : true;

    if (isValid) {
      setStep(prev => Math.min(prev + 1, steps.length - 1));
    }
  };

  const prevStep = () => {
    setStep(prev => Math.max(prev - 1, 0));
  };

  // Animazione per la transizione tra i passi
  const variants = {
    hidden: { opacity: 0, x: 50 },
    visible: { opacity: 1, x: 0 },
    exit: { opacity: 0, x: -50 },
  };

  return (
    <div className="container max-w-3xl mx-auto py-8">
      <div className="mt-8">
        {/* Indicatore di progresso */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${i < step ? "bg-primary text-primary-foreground border-primary" :
                    i === step ? "border-primary text-primary" :
                      "border-muted text-muted-foreground"
                    }`}
                >
                  {i < step ? (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ duration: 0.3 }}
                    >
                      <Check className="h-5 w-5" />
                    </motion.div>
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm mt-2 ${i === step ? "font-medium" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
                {s.description && (
                  <span className="text-xs text-muted-foreground hidden md:block">
                    {i === step && s.description}
                  </span>
                )}
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-muted rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <motion.div
                className="h-1 bg-primary rounded-full transition-all"
                initial={{ width: `${(0 / (steps.length - 1)) * 100}%` }}
                animate={{ width: `${(step / (steps.length - 1)) * 100}%` }}
                transition={{ duration: 0.5, ease: "easeInOut" }}
              />
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <Card className="border border-border">
              <CardHeader>
                <CardTitle>{steps[step].title}</CardTitle>
                <CardDescription>{steps[step].description}</CardDescription>
              </CardHeader>
              <CardContent>
                <motion.div
                  key={step}
                  initial="hidden"
                  animate="visible"
                  exit="exit"
                  variants={variants}
                  transition={{ duration: 0.3 }}
                >
                  {steps[step].content}
                </motion.div>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button
                  type="button"
                  variant="outline"
                  onClick={prevStep}
                  disabled={step === 0}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Indietro
                </Button>
                {step < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="flex items-center gap-2"
                  >
                    Avanti
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                ) : (
                  <motion.div
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="flex items-center gap-2 relative"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin mr-1"></div>
                          Salvataggio...
                        </>
                      ) : (
                        <>
                          Completa Onboarding
                          <Check className="h-4 w-4" />
                        </>
                      )}
                    </Button>
                  </motion.div>
                )}
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Conferma Configurazione</DialogTitle>
            <DialogDescription>
              Sei sicuro di voler completare l&apos;onboarding con queste impostazioni? Potrai sempre modificarle in seguito dalle impostazioni del tuo profilo.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col space-y-4 py-3">
            <div className="flex items-center space-x-2">
              <div className="rounded-full w-8 h-8 bg-primary flex items-center justify-center text-white">
                <Check className="h-4 w-4" />
              </div>
              <div>
                <p className="text-sm font-medium">Riepilogo della tua configurazione</p>
                <p className="text-xs text-muted-foreground">
                  Lingua: {form.getValues("language") === "it" ? "Italiano" : "English"} •
                  Valuta: {form.getValues("primaryCurrency")}
                </p>
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-1">Conti di Liquidità ({accounts.length})</p>
              <div className="max-h-20 overflow-y-auto text-xs text-muted-foreground space-y-1">
                {accounts.map((account, index) => (
                  <div key={index} className="flex justify-between">
                    <span>{account.name}</span>
                    <span>
                      {formatCurrency(account.balance, form.getValues("primaryCurrency"))}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="border-t pt-3">
              <p className="text-sm font-medium mb-1">
                Categorie {useDefaultCategories
                  ? `(${defaultCategories.length} predefinite)`
                  : `(${categories.length} personalizzate)`}
              </p>
              <div className="max-h-28 overflow-y-auto text-xs text-muted-foreground">
                {useDefaultCategories ? (
                  <div className="space-y-1">
                    <p>Verranno create {defaultCategories.filter(c => c.type === "income").length} categorie di entrata e {defaultCategories.filter(c => c.type === "expense").length} categorie di spesa con relative sottocategorie.</p>
                    <p>Queste categorie predefinite ti aiuteranno a organizzare facilmente le tue finanze.</p>
                  </div>
                ) : (
                  <div className="space-y-1">
                    {categories.map((category, index) => (
                      <div key={index} className="flex justify-between">
                        <span>{category.name || "(Senza nome)"}</span>
                        <span className={category.type === "income" ? "text-green-600" : "text-red-600"}>
                          {category.type === "income" ? "Entrata" : "Spesa"}
                          {category.subcategories && category.subcategories.length > 0 &&
                            ` (${category.subcategories.length})`}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter className="sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => setShowConfirmDialog(false)}
              disabled={isSubmitting}
            >
              Torna indietro
            </Button>
            <Button
              type="button"
              onClick={handleConfirmedSubmit}
              disabled={isSubmitting}
              className="flex items-center gap-2"
            >
              {isSubmitting ? "Salvataggio..." : "Conferma e Completa"}
              <Check className="h-4 w-4" />
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
