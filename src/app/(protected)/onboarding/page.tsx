"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { zodResolver } from "@hookform/resolvers/zod";
// @ts-ignore - react-hook-form does export useForm, but TypeScript isn't recognizing it
import { useForm } from "react-hook-form";
import { z } from "zod";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { useTheme } from "next-themes";
import * as LucideIcons from "lucide-react";

import { PageHeader } from "@/components/ui/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ThemeToggle } from "@/components/theme-toggle";
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
  Coins, 
  PiggyBank, 
  Languages, 
  DollarSign, 
  Euro, 
  PoundSterling, 
  Circle, 
  Bitcoin,
  Plus,
  Trash2,
  Tag,
  ArrowDown,
  ArrowUp,
  ShoppingBag
} from "lucide-react";

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

type OnboardingFormValues = z.infer<typeof onboardingSchema>;

// Componente principale della pagina di onboarding
export default function OnboardingPage() {
  const router = useRouter();
  const { data: session, update } = useSession();
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { setTheme } = useTheme();
  const [useDefaultCategories, setUseDefaultCategories] = useState(true);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  // Stati per tenere traccia degli account e delle categorie
  const [accounts, setAccounts] = useState<any[]>([
    { name: "Conto Corrente", type: "checking", balance: 0 }
  ]);
  const [categories, setCategories] = useState<any[]>([]);

  // Inizializza il form con valori predefiniti
  const form = useForm<OnboardingFormValues>({
    resolver: zodResolver(onboardingSchema),
    defaultValues: {
      language: "it",
      primaryCurrency: "EUR",
      liquidityAccounts: [
        { name: "Conto Corrente", type: "checking", balance: 0 }
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
    if (categories[parentIndex] && categories[parentIndex].subcategories) {
      const updatedCategories = [...categories];
      updatedCategories[parentIndex].subcategories = updatedCategories[parentIndex].subcategories.filter(
        (_: any, i: number) => i !== subIndex
      );
      setCategories(updatedCategories);
    }
  };

  // Funzione per aggiornare un campo specifico di un account
  const updateAccount = (index: number, field: string, value: any) => {
    const updatedAccounts = [...accounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setAccounts(updatedAccounts);
  };

  // Funzione per aggiornare un campo specifico di una categoria
  const updateCategory = (index: number, field: string, value: any) => {
    const updatedCategories = [...categories];
    updatedCategories[index] = { ...updatedCategories[index], [field]: value };
    setCategories(updatedCategories);
  };

  // Funzione per gestire l'invio del form
  const onSubmit = async (data: OnboardingFormValues) => {
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
        
      const response = await fetch("/api/user/onboarding", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Si è verificato un errore durante l'onboarding");
      }

      // Aggiorna la sessione per riflettere che l'onboarding è stato completato
      await update({ hasCompletedOnboarding: true });
      
      toast.success("Onboarding completato con successo!");
      router.push("/dashboard");
    } catch (error) {
      console.error("Errore durante l'onboarding:", error);
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante l'onboarding");
    } finally {
      setIsSubmitting(false);
    }
  };

  console.log("categories", categories)

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
            render={({ field }: { field: any }) => (
              <FormItem>
                <FormLabel>Lingua</FormLabel>
                <FormDescription>
                  Scegli la lingua dell'interfaccia
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
            render={({ field }: { field: any }) => (
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
                    <SelectItem value="EUR">
                      <div className="flex items-center">
                        <Euro className="mr-2 h-4 w-4" />
                        <span>Euro (EUR)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="USD">
                      <div className="flex items-center">
                        <DollarSign className="mr-2 h-4 w-4" />
                        <span>Dollaro USA (USD)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="GBP">
                      <div className="flex items-center">
                        <PoundSterling className="mr-2 h-4 w-4" />
                        <span>Sterlina (GBP)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="JPY">
                      <div className="flex items-center">
                        <Circle className="mr-2 h-4 w-4" />
                        <span>Yen (JPY)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="CHF">
                      <div className="flex items-center">
                        <Coins className="mr-2 h-4 w-4" />
                        <span>Franco Svizzero (CHF)</span>
                      </div>
                    </SelectItem>
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
          <div className="flex justify-between items-center">
            <FormLabel className="text-lg">I tuoi Conti</FormLabel>
            <Button
              type="button"
              variant="outline"
              onClick={addLiquidityAccount}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Aggiungi Conto
            </Button>
          </div>
          
          <FormDescription>
            Aggiungi i tuoi conti bancari, risparmi e contanti per tenere traccia delle tue finanze
          </FormDescription>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {accounts.map((account, index) => (
              <AccountForm 
                key={index}
                form={form}
                index={index}
                account={account}
                removeAccount={removeLiquidityAccount}
                currency={form.getValues("primaryCurrency")}
                updateAccount={(field, value) => updateAccount(index, field, value)}
              />
            ))}
          </div>
        </div>
      ),
    },
    {
      title: "Categorie",
      description: "Imposta le tue categorie di entrate e spese",
      content: (
        <div className="space-y-6">
          <div className="flex flex-col space-y-4">
            <div className="flex items-center justify-between">
              <FormLabel className="text-lg">Le tue Categorie</FormLabel>
              <div className="flex space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCategory("income")}
                  className="flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border-green-200"
                >
                  <ArrowUp className="h-4 w-4" />
                  Entrata
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => addCategory("expense")}
                  className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 border-red-200"
                >
                  <ArrowDown className="h-4 w-4" />
                  Spesa
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
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
                className="rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label htmlFor="useDefaultCategories" className="text-sm">
                Usa le categorie predefinite (consigliato)
              </label>
            </div>
            
            <FormDescription>
              {useDefaultCategories 
                ? "Verranno create categorie predefinite per entrate e spese." 
                : "Aggiungi categorie personalizzate per entrate e spese."}
            </FormDescription>
          </div>
          
          {useDefaultCategories ? (
            <div className="mt-4 border rounded-md p-4 bg-muted/20">
              <h3 className="text-sm font-medium mb-3">Anteprima delle categorie predefinite:</h3>
              <DefaultCategories showSubcategories={true} />
            </div>
          ) : (
            <div className="space-y-4">
              {categories.length === 0 && (
                <div className="text-center py-8 border rounded-md border-dashed">
                  <p className="text-muted-foreground">
                    Nessuna categoria personalizzata.
                    <br />
                    Usa i pulsanti "Entrata" e "Spesa" per aggiungerne.
                  </p>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {categories.map((category, index) => (
                  <CategoryForm 
                    key={index}
                    form={form}
                    index={index}
                    category={category}
                    removeCategory={removeCategory}
                    addSubcategory={addSubcategory}
                    removeSubcategory={removeSubcategory}
                    updateCategory={(field, value) => updateCategory(index, field, value)}
                  />
                ))}
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
          <Card>
            <CardHeader>
              <CardTitle>Preferenze</CardTitle>
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
                  <p className="text-base">{form.getValues("primaryCurrency")}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Conti di Liquidità</CardTitle>
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
                    <div key={index} className="flex justify-between items-center p-3 border rounded-md">
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
                          {account.balance.toFixed(2)} 
                          {form.getValues("primaryCurrency") === "EUR" && "€"}
                          {form.getValues("primaryCurrency") === "USD" && "$"}
                          {form.getValues("primaryCurrency") === "GBP" && "£"}
                          {form.getValues("primaryCurrency") === "JPY" && "¥"}
                          {form.getValues("primaryCurrency") === "CHF" && "Fr"}
                          {!["EUR", "USD", "GBP", "JPY", "CHF"].includes(form.getValues("primaryCurrency")) && form.getValues("primaryCurrency")}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Categorie</CardTitle>
              <CardDescription>Le tue categorie di entrate e spese</CardDescription>
            </CardHeader>
            <CardContent>
              {useDefaultCategories ? (
                <div className="p-3 border rounded-md">
                  <p className="text-muted-foreground mb-2">
                    Verranno create le categorie predefinite per entrate e spese.
                  </p>
                  <DefaultCategories compact={true} showSubcategories={false} />
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {categories.map((category, index) => {
                        const IconComponent = category.icon 
                          ? (LucideIcons as any)[toPascalCase(category.icon)] || LucideIcons.CircleDashed 
                          : category.type === "income" 
                            ? LucideIcons.TrendingUp 
                            : LucideIcons.ShoppingBag;
                            
                        // Convert kebab-case to PascalCase for Lucide icon names
                        function toPascalCase(str: string) {
                          return str
                            .split("-")
                            .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                            .join("");
                        }
                        
                        return (
                          <Card key={index} className={`border-l-4 ${category.type === 'income' ? 'border-l-green-500' : 'border-l-red-500'}`}>
                            <CardContent className="p-4 flex items-center gap-3">
                              <div 
                                className="flex items-center justify-center h-10 w-10 rounded-full" 
                                style={{ backgroundColor: category.color || (category.type === "income" ? "#4CAF50" : "#F44336") }}
                              >
                                <IconComponent className="h-5 w-5 text-white" />
                              </div>
                              <div>
                                <p className="font-medium">{category.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {category.type === "income" ? "Entrata" : "Spesa"}
                                  {category.subcategories && category.subcategories.length > 0 && 
                                    ` • ${category.subcategories.length} sottocategorie`}
                                </p>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
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
      return form.trigger(field as any);
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
      <div className="flex justify-between items-center">

        <div className="flex items-center">
          <ThemeToggle />
        </div>
      </div>

      <div className="mt-8">
        {/* Indicatore di progresso */}
        <div className="mb-8">
          <div className="flex justify-between">
            {steps.map((s, i) => (
              <div key={i} className="flex flex-col items-center">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center border-2 ${
                    i < step ? "bg-primary text-primary-foreground border-primary" : 
                    i === step ? "border-primary text-primary" : 
                    "border-muted text-muted-foreground"
                  }`}
                >
                  {i < step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <span>{i + 1}</span>
                  )}
                </div>
                <span className={`text-sm mt-2 ${i === step ? "font-medium" : "text-muted-foreground"}`}>
                  {s.title}
                </span>
              </div>
            ))}
          </div>
          <div className="relative mt-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full h-1 bg-muted rounded-full" />
            </div>
            <div className="absolute inset-0 flex items-center">
              <div 
                className="h-1 bg-primary rounded-full transition-all duration-300" 
                style={{ width: `${(step / (steps.length - 1)) * 100}%` }}
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
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex items-center gap-2"
                  >
                    {isSubmitting ? "Salvataggio..." : "Completa Onboarding"}
                    <Check className="h-4 w-4" />
                  </Button>
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
              Sei sicuro di voler completare l'onboarding con queste impostazioni? Potrai sempre modificarle in seguito dalle impostazioni del tuo profilo.
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
                      {account.balance.toFixed(2)} 
                      {form.getValues("primaryCurrency") === "EUR" && "€"}
                      {form.getValues("primaryCurrency") === "USD" && "$"}
                      {form.getValues("primaryCurrency") === "GBP" && "£"}
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
