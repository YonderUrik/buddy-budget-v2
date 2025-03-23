"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Trash2,
  Plus,
  ArrowDown,
  ArrowUp,
  ChevronDown,
  ChevronUp,
  BadgeCheck,
  AlertCircle,
  CheckCircle2,
  Info
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { CategoryDisplay, CategoryItem, CategoryType } from "@/components/shared/category-display";
import { ColorPalette } from "@/components/shared/color-palette";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

// Type definition for Lucide icons
type LucideIcon = React.ComponentType<{ className?: string }>;

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

interface Subcategory {
  name: string;
}

type Category = {
  name: string;
  type: "income" | "expense"; // Assuming these are the only two types
  icon?: string;
  color?: string;
  subcategories?: Subcategory[]; // Updated type definition
};

type CategoryFormProps = {
  index: number;
  category: Category;
  removeCategory: (index: number) => void;
  addSubcategory: (parentIndex: number) => void;
  removeSubcategory: (parentIndex: number, subIndex: number) => void;
  updateCategory: (field: string, value: string | Subcategory[]) => void; // Updated type definition
};

export function CategoryForm({
  index,
  category,
  removeCategory,
  addSubcategory,
  removeSubcategory,
  updateCategory
}: CategoryFormProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isFocused, setIsFocused] = React.useState<string | null>(null);
  const [isValid, setIsValid] = React.useState({
    name: true
  });

  const hasSubcategories = category.subcategories && category.subcategories.length > 0;

  React.useEffect(() => {
    setIsValid({
      name: category.name?.length > 0
    });
  }, [category.name]);

  const defaultColor = category.type === "income" ? "#4CAF50" : "#F44336";
  const previewCategory: CategoryItem = {
    name: category.name || (category.type === "income" ? "Nuova Entrata" : "Nuova Spesa"),
    type: category.type as CategoryType,
    icon: category.icon || (category.type === "income" ? "trending-up" : "shopping-bag"),
    color: category.color || defaultColor,
    subcategories: category.subcategories
  };

  // Function to get category type properties
  const getCategoryTypeStyles = () => {
    if (category.type === 'income') {
      return {
        borderColor: 'border-green-500',
        iconBg: 'bg-green-500',
        hoverBg: 'hover:bg-green-50',
        labelText: 'Entrata',
        icon: <ArrowUp className="h-4 w-4 text-white" />
      };
    } else {
      return {
        borderColor: 'border-red-500',
        iconBg: 'bg-red-500',
        hoverBg: 'hover:bg-red-50',
        labelText: 'Spesa',
        icon: <ArrowDown className="h-4 w-4 text-white" />
      };
    }
  };

  const typeStyles = getCategoryTypeStyles();

  return (
    <Card
      className={cn(
        "border-l-4 transition-all",
        typeStyles.borderColor,
        isFocused ? "ring-2 ring-primary/30 shadow-md" : "hover:shadow-sm"
      )}
    >
      <CardHeader className="pb-3 flex flex-row items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={cn("p-1 rounded-full", typeStyles.iconBg)}>
            {typeStyles.icon}
          </div>
          <CardTitle className="text-base flex items-center gap-1">
            {typeStyles.labelText}
            {hasSubcategories && (
              <Badge variant="outline" className="text-xs ml-1 font-normal">
                {category?.subcategories?.length || 0}
              </Badge>
            )}
          </CardTitle>
        </div>
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => removeCategory(index)}
                className="text-destructive hover:text-destructive/90 hover:bg-destructive/10 h-8 w-8"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="left">
              <p>Rimuovi questa categoria</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </CardHeader>
      <CardContent className="space-y-4 pt-2">
        {/* Preview */}
        <motion.div
          className="border rounded-lg p-3 bg-muted/10"
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          <CategoryDisplay category={previewCategory} showSubcategories={hasSubcategories} />
        </motion.div>

        {/* Category Name */}
        <div className="space-y-2">
          <FormLabel className="flex items-center justify-between">
            <span>Nome della Categoria</span>
            {isFocused === 'name' && (
              <span className="text-xs font-normal text-muted-foreground">
                {category.name?.length ? `${category.name.length} caratteri` : 'Campo obbligatorio'}
              </span>
            )}
          </FormLabel>
          <div className="relative">
            <Input
              placeholder="Es. Stipendio, Spesa, Affitto..."
              value={category.name || ""}
              onChange={(e) => updateCategory("name", e.target.value)}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused(null)}
              className={cn(
                "pr-8",
                !isValid.name && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {!isValid.name && <AlertCircle className="h-4 w-4 text-destructive" />}
              {isValid.name && category.name?.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          {!isValid.name && (
            <p className="text-xs text-destructive">Il nome della categoria è obbligatorio</p>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          {/* Icon Selection */}
          <div className="space-y-2">
            <FormLabel>Icona</FormLabel>
            <Select
              value={category.icon || (category.type === "income" ? "trending-up" : "shopping-bag")}
              onValueChange={(value) => updateCategory("icon", value)}
            >
              <SelectTrigger
                className="flex items-center"
                onFocus={() => setIsFocused('icon')}
                onBlur={() => setIsFocused(null)}
              >
                <SelectValue placeholder="Seleziona un'icona">
                  {category.icon && (
                    <div className="flex items-center gap-2">
                      {(() => {
                        const IconComponent = (LucideIcons as Record<string, LucideIcon>)[toPascalCase(category.icon)] || LucideIcons.CircleDashed;
                        const iconLabel = commonIcons.find(i => i.value === category.icon)?.label || category.icon;
                        return (
                          <>
                            <div className="p-1 rounded-full bg-muted">
                              <IconComponent className="h-3 w-3" />
                            </div>
                            <span>{iconLabel}</span>
                          </>
                        );
                      })()}
                    </div>
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="max-h-[300px]">
                <div className="grid grid-cols-3 gap-1 p-1">
                  {commonIcons.map((icon) => {
                    const IconComponent = (LucideIcons as Record<string, LucideIcon>)[toPascalCase(icon.value)] || LucideIcons.CircleDashed;
                    return (
                      <SelectItem
                        key={icon.value}
                        value={icon.value}
                        className="flex flex-col items-center justify-center h-16 data-[state=checked]:bg-primary/10"
                      >
                        <div className="flex flex-col items-center gap-1">
                          <div className="p-2 rounded-full bg-muted/50">
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-xs">{icon.label}</span>
                        </div>
                      </SelectItem>
                    )
                  })}
                </div>
              </SelectContent>
            </Select>
          </div>

          {/* Color Selection */}
          <div className="space-y-2">
            <FormLabel>Colore</FormLabel>
            <div
              className="relative"
              onFocus={() => setIsFocused('color')}
              onBlur={() => setIsFocused(null)}
            >
              <ColorPalette
                selectedColor={category.color || defaultColor}
                categoryType={category.type}
                onChange={(color) => updateCategory("color", color)}
                className="my-2"
              />
            </div>
          </div>
        </div>

        {/* Subcategories section */}
        <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mt-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1">
              <h4 className="text-sm font-medium">Sottocategorie</h4>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Info className="h-3 w-3 text-muted-foreground cursor-help" />
                  </TooltipTrigger>
                  <TooltipContent side="top" className="max-w-60">
                    <p className="text-xs">Le sottocategorie ti aiutano ad organizzare meglio le transazioni all&apos;interno di una categoria principale</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="flex items-center gap-2">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => addSubcategory(index)}
                      className={cn("h-7 px-2 text-xs", typeStyles.hoverBg)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      Aggiungi
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Aggiungi una sottocategoria</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <CollapsibleTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0"
                >
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
            <AnimatePresence>
              {hasSubcategories ? (
                <motion.div
                  className="space-y-3 pl-4 border-l-2 border-muted mt-2"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  {category?.subcategories?.map((subcategory, subIndex) => (
                    <motion.div
                      key={subIndex}
                      className="flex items-center gap-2"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.2, delay: subIndex * 0.05 }}
                    >
                      <Input
                        placeholder="Nome sottocategoria..."
                        value={subcategory.name || ""}
                        onChange={(e) => {
                          const updatedSubcategories = [...(category.subcategories || [])];
                          updatedSubcategories[subIndex] = {
                            ...updatedSubcategories[subIndex],
                            name: e.target.value
                          };
                          updateCategory("subcategories", updatedSubcategories);
                        }}
                        className="h-8"
                      />
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={() => removeSubcategory(index, subIndex)}
                              className="h-8 w-8 p-0 text-destructive"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </TooltipTrigger>
                          <TooltipContent side="left">
                            <p>Rimuovi questa sottocategoria</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </motion.div>
                  ))}
                </motion.div>
              ) : (
                <motion.p
                  className="text-xs text-muted-foreground mt-2 pl-4 border-l-2 border-muted pt-2"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.2 }}
                >
                  Nessuna sottocategoria. Clicca &quot;Aggiungi&quot; per crearne una.
                </motion.p>
              )}
            </AnimatePresence>
          </CollapsibleContent>
        </Collapsible>
      </CardContent>
      {isFocused && (
        <CardFooter className="pt-0 pb-3 justify-end opacity-60 text-xs">
          <div className="flex items-center gap-1">
            <BadgeCheck className="h-3 w-3" />
            <span>I dati possono essere modificati in qualsiasi momento</span>
          </div>
        </CardFooter>
      )}
    </Card>
  );
} 