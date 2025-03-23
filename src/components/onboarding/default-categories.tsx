"use client";

import * as React from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryDisplay, CategoryItem } from "@/components/shared/category-display";

// Default categories with subcategories - export to make available to other components
export const defaultCategories: CategoryItem[] = [
  { 
    name: "Stipendio", 
    type: "income", 
    icon: "banknote", 
    color: "#4CAF50",
    subcategories: [
      { name: "Lavoro Full-time" },
      { name: "Lavoro Part-time" }
    ]
  },
  { 
    name: "Bonus", 
    type: "income", 
    icon: "gift", 
    color: "#8BC34A",
    subcategories: [
      { name: "Premio Produzione" },
      { name : 'Fringe Benefits'}
    ]
  },
  { 
    name: "Investimenti", 
    type: "income", 
    icon: "trending-up", 
    color: "#009688",
    subcategories: [
      { name: "Dividendi" },
      { name: "Interessi" },
      { name: "Affitti Ricevuti" }
    ]
  },
  { 
    name: "Casa", 
    type: "expense", 
    icon: "home", 
    color: "#F44336",
    subcategories: [
      { name: "Affitto" },
      { name: "Mutuo" },
      { name: "Spese Condominiali" },
      { name: "Mobili" },
    ]
  },
  { 
    name: "Alimentari", 
    type: "expense", 
    icon: "shopping-cart", 
    color: "#FF9800",
    subcategories: [
      { name: "Spesa" },
      { name: "Mangiare fuori" },
      { name: "Bar" },
      { name: "Aperitivi" },
    ]
  },
  { 
    name: "Trasporti", 
    type: "expense", 
    icon: "car", 
    color: "#795548",
    subcategories: [
      { name: "Carburante" },
      { name: "Trasporto Pubblico" },
      { name: "Manutenzione" },
      { name: "Aerei/Treni/Bus" },
      { name: "Car sharing" },
      { name: "Assicurazione" }
    ]
  },
  { 
    name: "Bollette", 
    type: "expense", 
    icon: "zap", 
    color: "#FF5722",
    subcategories: [
      { name: "Elettricità" },
      { name: "Gas" },
      { name: "Acqua" },
      { name: "Internet" },
      { name: "Telefono" },
    ]
  },
  { 
    name: "Svago", 
    type: "expense", 
    icon: "film", 
    color: "#9C27B0",
    subcategories: [
      { name: "Cinema" },
      { name: "Viaggi" },
      { name: "Abbonamenti" }
    ]
  },
  { 
    name: "Salute", 
    type: "expense", 
    icon: "heart", 
    color: "#E91E63",
    subcategories: [
      { name: "Medico" },
      { name: "Farmacia" },
      { name: "Palestra" }
    ]
  },
  { 
    name: "Istruzione", 
    type: "expense", 
    icon: "book", 
    color: "#3F51B5",
    subcategories: [
      { name: "Corsi" },
      { name: "Libri" },
      { name: "Software" }
    ]
  },
];

interface DefaultCategoriesProps {
  showSubcategories?: boolean;
  compact?: boolean;
}

export function DefaultCategories({ showSubcategories = false, compact = false }: DefaultCategoriesProps) {
  // Filter categories by type
  const incomeCategories = defaultCategories.filter(cat => cat.type === "income");
  const expenseCategories = defaultCategories.filter(cat => cat.type === "expense");

  return (
    <Tabs defaultValue="income" className="w-full">
      <TabsList className="grid w-full grid-cols-2 mb-4">
        <TabsTrigger 
          value="income" 
          className="data-[state=active]:bg-green-50 data-[state=active]:text-green-700 data-[state=active]:border-green-200"
        >
          Entrate
        </TabsTrigger>
        <TabsTrigger 
          value="expense"
          className="data-[state=active]:bg-red-50 data-[state=active]:text-red-700 data-[state=active]:border-red-200"
        >
          Uscite
        </TabsTrigger>
      </TabsList>
      
      <TabsContent value="income" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {incomeCategories.map((category, index) => (
            <CategoryDisplay 
              key={index} 
              category={category} 
              showSubcategories={showSubcategories}
              compact={compact}
            />
          ))}
        </div>
      </TabsContent>
      
      <TabsContent value="expense" className="mt-0">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {expenseCategories.map((category, index) => (
            <CategoryDisplay 
              key={index} 
              category={category} 
              showSubcategories={showSubcategories}
              compact={compact}
            />
          ))}
        </div>
      </TabsContent>
    </Tabs>
  );
} 