import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { notFound } from "next/navigation";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
   User,
   Shield,
   Tag,
   CircleSlash
} from "lucide-react";

import { SettingsSection } from "@/components/settings/settings-section";
import { PersonalInfoForm } from "@/components/settings/personal-info-form";
import { PasswordForm } from "@/components/settings/password-form";
import { CategoriesManager } from "@/components/settings/categories-manager";
import { DeleteAccount } from "@/components/settings/delete-account";
import { prisma } from "@/lib/prisma";

// Define types
type CategoryType = "income" | "expense";

type Category = {
   id: string;
   name: string;
   type: CategoryType;
   icon: string;
   color: string;
   parentId: string | null;
   level: number;
   order: number;
   isDeleted: boolean;
   subcategories?: Category[];
};

export default async function SettingsPage() {
   const session = await getServerSession(authOptions);

   if (!session?.user?.id) {
      return notFound();
   }

   // Fetch user data
   const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
         id: true,
         name: true,
         email: true,
         primaryCurrency: true,
         settings: true
      }
   });

   if (!user) {
      return notFound();
   }

   // Fetch user categories
   const dbCategories = await prisma.category.findMany({
      where: {
         userId: session.user.id,
         isDeleted: false
      },
      orderBy: [
         { level: 'asc' },
         { order: 'asc' }
      ]
   });

   // Convert DB categories to our Category type
   const categories: Category[] = dbCategories.map(cat => ({
      id: cat.id,
      name: cat.name,
      type: (cat.type as CategoryType),
      icon: cat.icon || "circle",
      color: cat.color || (cat.type === "income" ? "#4CAF50" : "#F44336"),
      parentId: cat.parentId,
      level: cat.level,
      order: cat.order,
      isDeleted: cat.isDeleted
   }));

   return (
      <div className="container max-w-4xl mx-auto py-0">
         <div>
            <h1 className="text-3xl font-bold tracking-tight">Impostazioni</h1>
            <p className="text-muted-foreground mt-2">
               Gestisci il tuo account, le preferenze e le categorie
            </p>
         </div>

         <Tabs defaultValue="account" className="space-y-6">
            <TabsList className="w-full justify-start my-2 h-auto overflow-x-auto">
               <TabsTrigger value="account" className="flex gap-2 p-3">
                  <User className="h-4 w-4" />
                  <span>Account</span>
               </TabsTrigger>
               <TabsTrigger value="security" className="flex gap-2 p-3">
                  <Shield className="h-4 w-4" />
                  <span>Sicurezza</span>
               </TabsTrigger>
               <TabsTrigger value="categories" className="flex gap-2 p-3">
                  <Tag className="h-4 w-4" />
                  <span>Categorie</span>
               </TabsTrigger>
               <TabsTrigger value="danger" className="flex gap-2 p-3">
                  <CircleSlash className="h-4 w-4" />
                  <span>Zona Pericolo</span>
               </TabsTrigger>
            </TabsList>

            <TabsContent value="account" className="space-y-6">
               <SettingsSection
                  title="Informazioni Personali"
                  description="Gestisci le tue informazioni personali e le preferenze dell'account"
               >
                  <PersonalInfoForm
                     initialData={{
                        name: user.name,
                        email: user.email,
                        primaryCurrency: user.primaryCurrency
                     }}
                  />
               </SettingsSection>
            </TabsContent>

            <TabsContent value="security" className="space-y-6">
               <SettingsSection
                  title="Cambia Password"
                  description="Aggiorna la password del tuo account per migliorare la sicurezza"
               >
                  <PasswordForm />
               </SettingsSection>
            </TabsContent>

            <TabsContent value="categories" className="space-y-6">
               <SettingsSection
                  title="Gestione Categorie"
                  description="Gestisci le categorie utilizzate per organizzare le tue transazioni"
               >
                  <CategoriesManager
                     initialCategories={categories}
                  />
               </SettingsSection>
            </TabsContent>

            <TabsContent value="danger" className="space-y-6">
               <SettingsSection
                  title="Zona Pericolo"
                  description="Azioni irreversibili per il tuo account"
                  destructive
               >
                  <Separator className="my-4" />
                  <DeleteAccount
                     userEmail={user.email}
                  />
               </SettingsSection>
            </TabsContent>
         </Tabs>
      </div>
   );
}