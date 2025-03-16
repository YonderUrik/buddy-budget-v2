"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, Plus, ArrowDown, ArrowUp, ChevronDown, ChevronUp } from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CategoryDisplay, CategoryItem, CategoryType } from "@/components/shared/category-display";
import { ColorPalette } from "@/components/shared/color-palette";

// Convert kebab-case to PascalCase for Lucide icon names
function toPascalCase(str: string) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

// Common icons for categories with better descriptions
const commonIcons = [
  { value: "shopping-bag", label: "Shopping" },
  { value: "shopping-cart", label: "Carrello" },
  { value: "trending-up", label: "Grafico" },
  { value: "home", label: "Casa" },
  { value: "coffee", label: "Caffè" },
  { value: "utensils", label: "Cibo" },
  { value: "car", label: "Auto" },
  { value: "briefcase", label: "Lavoro" },
  { value: "heart", label: "Salute" },
  { value: "gift", label: "Regalo" },
  { value: "dollar-sign", label: "Soldi" },
  { value: "book", label: "Libri" },
  { value: "music", label: "Musica" },
  { value: "wifi", label: "Internet" },
  { value: "phone", label: "Telefono" },
  { value: "credit-card", label: "Carta" },
  { value: "train", label: "Treno" },
  { value: "plane", label: "Aereo" },
  { value: "zap", label: "Elettricità" },
  { value: "scissors", label: "Barbiere" },
  { value: "film", label: "Cinema" },
  { value: "tv", label: "TV" },
  { value: "monitor", label: "Computer" },
  { value: "shirt", label: "Vestiti" },
  { value: "baby", label: "Bambini" },
  { value: "school", label: "Scuola" },
  { value: "building", label: "Ufficio" },
  { value: "banknote", label: "Stipendio" },
  { value: "landmark", label: "Banca" },
  { value: "piggy-bank", label: "Risparmi" },
];

type CategoryFormProps = {
  form: any;
  index: number;
  category: any;
  removeCategory: (index: number) => void;
  addSubcategory: (parentIndex: number) => void;
  removeSubcategory: (parentIndex: number, subIndex: number) => void;
  updateCategory: (field: string, value: any) => void;
};

export function CategoryForm({ 
  form, 
  index, 
  category, 
  removeCategory, 
  addSubcategory, 
  removeSubcategory,
  updateCategory
}: CategoryFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  
  const defaultColor = category.type === "income" ? "#4CAF50" : "#F44336";
  const previewCategory: CategoryItem = {
    name: category.name || (category.type === "income" ? "Nuova Entrata" : "Nuova Spesa"),
    type: category.type as CategoryType,
    icon: category.icon || (category.type === "income" ? "trending-up" : "shopping-bag"),
    color: category.color || defaultColor,
    subcategories: category.subcategories
  };

  return (
    <Card className={`border-l-4 ${category.type === 'income' ? 'border-l-green-500' : 'border-l-red-500'}`}>
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-base flex items-center gap-2">
            {category.type === 'income' ? (
              <ArrowUp className="h-4 w-4 text-green-500" />
            ) : (
              <ArrowDown className="h-4 w-4 text-red-500" />
            )}
            {category.type === 'income' ? 'Entrata' : 'Spesa'}
          </CardTitle>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeCategory(index)}
            className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4" />
            <span className="sr-only">Rimuovi</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Preview */}
        <div className="border rounded-lg p-2 bg-muted/20">
          <CategoryDisplay category={previewCategory} showSubcategories={hasSubcategories} />
        </div>
        
        {/* Category Name */}
        <div className="space-y-2">
          <FormLabel>Nome della Categoria</FormLabel>
          <Input 
            placeholder="Es. Stipendio, Spesa, Affitto..." 
            value={category.name || ""}
            onChange={(e) => updateCategory("name", e.target.value)}
          />
        </div>
        
        <div className="grid grid-cols-1 gap-4">
          {/* Icon Selection */}
          <div className="space-y-2">
            <FormLabel>Icona</FormLabel>
            <Select 
              value={category.icon || (category.type === "income" ? "trending-up" : "shopping-bag")} 
              onValueChange={(value) => updateCategory("icon", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleziona un'icona">
                  {category.icon && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const Icon = (LucideIcons as any)[toPascalCase(category.icon)] || LucideIcons.CircleDashed;
                        const iconLabel = commonIcons.find(i => i.value === category.icon)?.label || category.icon;
                        return (
                          <>
                            <Icon className="h-4 w-4" />
                            <span>{iconLabel}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                {commonIcons.map((icon) => {
                  const Icon = (LucideIcons as any)[toPascalCase(icon.value)] || LucideIcons.CircleDashed;
                  return (
                    <SelectItem key={icon.value} value={icon.value}>
                      <div className="flex items-center gap-2">
                        <Icon className="h-4 w-4" />
                        <span>{icon.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>
          
          {/* Color Selection */}
          <div className="space-y-2">
            <FormLabel>Colore</FormLabel>
            <ColorPalette 
              selectedColor={category.color || defaultColor}
              categoryType={category.type}
              onChange={(color) => updateCategory("color", color)}
              className="my-2"
            />
          </div>
        </div>
        
        {/* Subcategories section */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium">Sottocategorie</h4>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => addSubcategory(index)}
                className="h-7 px-2 text-xs"
              >
                <Plus className="h-3 w-3 mr-1" />
                Aggiungi
              </Button>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-7 w-7 p-0">
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
          
          <CollapsibleContent className="mt-2">
            {hasSubcategories ? (
              <div className="space-y-3 pl-4 border-l-2 border-muted mt-2">
                {category.subcategories.map((subcategory: any, subIndex: number) => (
                  <div key={subIndex} className="flex items-center gap-2">
                    <Input 
                      placeholder="Nome sottocategoria..." 
                      value={subcategory.name || ""}
                      onChange={(e) => {
                        const updatedSubcategories = [...category.subcategories];
                        updatedSubcategories[subIndex] = { 
                          ...updatedSubcategories[subIndex], 
                          name: e.target.value 
                        };
                        updateCategory("subcategories", updatedSubcategories);
                      }}
                      className="h-8" 
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => removeSubcategory(index, subIndex)}
                      className="h-8 w-8 p-0 text-destructive"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground mt-2">
                Nessuna sottocategoria. Clicca "Aggiungi" per crearne una.
              </p>
            )}
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
    </Card>
  );
} 