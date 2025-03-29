"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CategoryType, CategoryDisplay } from "@/components/shared/category-display";
import { Badge } from "@/components/ui/badge";
import {
  Plus,
  Search,
  Edit,
  Trash2,
  ArrowUp,
  ArrowDown,
  AlertCircle,
  X,
  CheckCircle2
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import { toast } from "sonner";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { ColorPalette } from "@/components/shared/color-palette";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import * as LucideIcons from "lucide-react";
import axios from "axios";

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

interface CategoriesManagerProps {
  initialCategories: Category[];
}

// Type definition for Lucide icons - using a simplified approach to avoid complex type issues
type LucideIcon = React.ComponentType<any>;

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
  { value: "phone", label: "Telefono" },
  { value: "credit-card", label: "Carta" },
  { value: "zap", label: "Elettricità" },
];

export function CategoriesManager({
  initialCategories
}: CategoriesManagerProps) {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState<"all" | "income" | "expense">("all");
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [categoryToDelete, setCategoryToDelete] = useState<Category | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateSubcategoryDialogOpen, setIsCreateSubcategoryDialogOpen] = useState(false);
  const [parentCategoryForSub, setParentCategoryForSub] = useState<Category | null>(null);
  const [newSubcategory, setNewSubcategory] = useState<string>("");
  const [newCategory, setNewCategory] = useState<Omit<Category, "id">>({
    name: "",
    type: "expense",
    icon: "shopping-bag",
    color: "#F44336",
    parentId: null,
    level: 0,
    order: 0,
    isDeleted: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter categories based on search and active tab
  const filteredCategories = categories.filter(category => {
    const matchesSearch = category.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesType = activeTab === "all" || category.type === activeTab;
    return matchesSearch && matchesType && !category.isDeleted;
  });

  // Group categories by parent
  const parentCategories = filteredCategories.filter(cat => cat.parentId === null);
  const childCategories = filteredCategories.filter(cat => cat.parentId !== null);

  // Create a hierarchical structure
  const hierarchicalCategories = parentCategories.map(parent => {
    const children = childCategories.filter(child => child.parentId === parent.id);
    return {
      ...parent,
      subcategories: children.sort((a, b) => a.order - b.order)
    };
  }).sort((a, b) => a.order - b.order);

  // Handler for editing a category
  const handleEditCategory = async () => {
    if (!selectedCategory) return;

    setIsSubmitting(true);
    try {
      await axios.put(`/api/settings/categories/${selectedCategory.id}`, {
        name: selectedCategory.name,
        icon: selectedCategory.icon,
        color: selectedCategory.color,
        type: selectedCategory.type
      });


      // Update local state
      setCategories(categories.map(cat =>
        cat.id === selectedCategory.id ? selectedCategory : cat
      ));

      setIsEditDialogOpen(false);
      toast.success("Categoria aggiornata con successo");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante l'aggiornamento");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for deleting a category
  const handleDeleteCategory = async () => {
    if (!categoryToDelete) return;

    setIsSubmitting(true);
    try {
      await axios.delete(`/api/settings/categories/${categoryToDelete.id}`);

      // Update local state
      setCategories(categories.map(cat =>
        cat.id === categoryToDelete.id ? { ...cat, isDeleted: true } : cat
      ));

      setIsDeleteDialogOpen(false);
      toast.success("Categoria eliminata con successo");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante l'eliminazione");
    } finally {
      setIsSubmitting(false);
      setCategoryToDelete(null);
    }
  };

  // Handler for creating a new category
  const handleCreateCategory = async () => {
    if (!newCategory.name) {
      toast.error("Il nome della categoria è obbligatorio");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await axios.post('/api/settings/categories', newCategory);

      // Add the new category to local state if returned
      if (response.data.category) {
        setCategories([...categories, response.data.category]);
      }

      setIsCreateDialogOpen(false);
      toast.success("Categoria creata con successo");
      router.refresh();

      // Reset new category form
      setNewCategory({
        name: "",
        type: "expense",
        icon: "shopping-bag",
        color: "#F44336",
        parentId: null,
        level: 0,
        order: 0,
        isDeleted: false
      });
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante la creazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handler for creating a new subcategory
  const handleCreateSubcategory = async () => {
    if (!parentCategoryForSub || !newSubcategory) {
      toast.error("È necessario inserire un nome per la sottocategoria");
      return;
    }

    setIsSubmitting(true);
    try {
      // Create subcategory structure
      const subcategoryData = {
        name: newSubcategory,
        type: parentCategoryForSub.type,
        icon: parentCategoryForSub.icon,
        color: parentCategoryForSub.color,
        parentId: parentCategoryForSub.id,
        level: 1,
        order: 0,
        isDeleted: false
      };

      const response = await axios.post('/api/settings/categories', subcategoryData);

      // Add the new subcategory to local state if returned
      if (response.data.category) {
        setCategories(prev => [...prev, response.data.category]);
      }

      setIsCreateSubcategoryDialogOpen(false);
      setNewSubcategory("");
      toast.success("Sottocategoria creata con successo");
      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "Si è verificato un errore durante la creazione");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-2 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Cerca categorie..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="icon"
              className="absolute right-0 top-0 h-full aspect-square rounded-l-none"
              onClick={() => setSearchQuery("")}
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Button onClick={() => setIsCreateDialogOpen(true)} className="w-full sm:w-auto">
          <Plus className="mr-2 h-4 w-4" />
          Nuova Categoria
        </Button>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={(value) => setActiveTab(value as "all" | "income" | "expense")}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tutte</TabsTrigger>
          <TabsTrigger value="income">
            <ArrowUp className="mr-1 h-4 w-4 text-green-500" />
            Entrate
          </TabsTrigger>
          <TabsTrigger value="expense">
            <ArrowDown className="mr-1 h-4 w-4 text-red-500" />
            Spese
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <CategoriesList
            categories={hierarchicalCategories}
            onEdit={(category) => {
              setSelectedCategory(category);
              setIsEditDialogOpen(true);
            }}
            onDelete={(category) => {
              setCategoryToDelete(category);
              setIsDeleteDialogOpen(true);
            }}
            onAddSubcategory={(category) => {
              setParentCategoryForSub(category);
              setIsCreateSubcategoryDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="income" className="mt-4">
          <CategoriesList
            categories={hierarchicalCategories.filter(cat => cat.type === "income")}
            onEdit={(category) => {
              setSelectedCategory(category);
              setIsEditDialogOpen(true);
            }}
            onDelete={(category) => {
              setCategoryToDelete(category);
              setIsDeleteDialogOpen(true);
            }}
            onAddSubcategory={(category) => {
              setParentCategoryForSub(category);
              setIsCreateSubcategoryDialogOpen(true);
            }}
          />
        </TabsContent>

        <TabsContent value="expense" className="mt-4">
          <CategoriesList
            categories={hierarchicalCategories.filter(cat => cat.type === "expense")}
            onEdit={(category) => {
              setSelectedCategory(category);
              setIsEditDialogOpen(true);
            }}
            onDelete={(category) => {
              setCategoryToDelete(category);
              setIsDeleteDialogOpen(true);
            }}
            onAddSubcategory={(category) => {
              setParentCategoryForSub(category);
              setIsCreateSubcategoryDialogOpen(true);
            }}
          />
        </TabsContent>
      </Tabs>

      {/* Edit Category Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Modifica Categoria</DialogTitle>
            <DialogDescription>
              Aggiorna i dettagli della categoria selezionata.
            </DialogDescription>
          </DialogHeader>

          {selectedCategory && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <label htmlFor="name" className="text-sm font-medium">Nome</label>
                <div className="relative">
                  <Input
                    id="name"
                    value={selectedCategory.name}
                    onChange={(e) => setSelectedCategory({ ...selectedCategory, name: e.target.value })}
                    className={!selectedCategory.name ? "border-destructive focus-visible:ring-destructive" : ""}
                  />
                  <div className="absolute right-2 top-1/2 -translate-y-1/2">
                    {!selectedCategory.name && <AlertCircle className="h-4 w-4 text-destructive" />}
                    {selectedCategory.name && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                  </div>
                </div>
                {!selectedCategory.name && (
                  <p className="text-xs text-destructive">Il nome della categoria è obbligatorio</p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Icon Selection */}
                <div className="space-y-2">
                  <label htmlFor="icon" className="text-sm font-medium">Icona</label>
                  <Select
                    value={selectedCategory.icon || (selectedCategory.type === "income" ? "trending-up" : "shopping-bag")}
                    onValueChange={(value) => setSelectedCategory({ ...selectedCategory, icon: value })}
                  >
                    <SelectTrigger className="flex items-center" id="icon">
                      <SelectValue placeholder="Seleziona un'icona">
                        {selectedCategory.icon && (
                          <div className="flex items-center gap-2">
                            {(() => {
                              const IconComponent = (LucideIcons as any)[toPascalCase(selectedCategory.icon)] || LucideIcons.CircleDashed;
                              const iconLabel = commonIcons.find(i => i.value === selectedCategory.icon)?.label || selectedCategory.icon;
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
                          const IconComponent = (LucideIcons as any)[toPascalCase(icon.value)] || LucideIcons.CircleDashed;
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
                          );
                        })}
                      </div>
                    </SelectContent>
                  </Select>
                </div>

                {/* Color Selection */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">Colore</label>
                  <ColorPalette
                    selectedColor={selectedCategory.color || (selectedCategory.type === "income" ? "#4CAF50" : "#F44336")}
                    categoryType={selectedCategory.type}
                    onChange={(color) => setSelectedCategory({ ...selectedCategory, color })}
                    className="my-2"
                  />
                </div>
              </div>

              {/* Preview */}
              <div className="border rounded-lg p-3 bg-muted/10">
                <CategoryDisplay
                  category={{
                    name: selectedCategory.name,
                    type: selectedCategory.type as CategoryType,
                    icon: selectedCategory.icon || (selectedCategory.type === "income" ? "trending-up" : "shopping-bag"),
                    color: selectedCategory.color || (selectedCategory.type === "income" ? "#4CAF50" : "#F44336"),
                    subcategories: selectedCategory.subcategories
                  }}
                  showSubcategories={false}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Annulla
            </Button>
            <Button
              disabled={isSubmitting || !selectedCategory?.name}
              onClick={handleEditCategory}
            >
              {isSubmitting ? "Salvando..." : "Salva Modifiche"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Category Confirmation */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Sei sicuro?</AlertDialogTitle>
            <AlertDialogDescription>
              Stai per eliminare la categoria &quot;{categoryToDelete?.name}&quot;.
              Questa azione non può essere annullata.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Annulla</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => handleDeleteCategory()}
              disabled={isSubmitting}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              {isSubmitting ? "Eliminando..." : "Elimina"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Create Category Dialog */}
      <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova Categoria</DialogTitle>
            <DialogDescription>
              Crea una nuova categoria per organizzare le tue transazioni.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="newName" className="text-sm font-medium">Nome</label>
              <div className="relative">
                <Input
                  id="newName"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                  placeholder="Es. Stipendio, Spesa, Affitto..."
                  className={!newCategory.name ? "border-destructive focus-visible:ring-destructive" : ""}
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2">
                  {!newCategory.name && <AlertCircle className="h-4 w-4 text-destructive" />}
                  {newCategory.name && <CheckCircle2 className="h-4 w-4 text-green-500" />}
                </div>
              </div>
              {!newCategory.name && (
                <p className="text-xs text-destructive">Il nome della categoria è obbligatorio</p>
              )}
            </div>

            <div className="grid gap-2">
              <label htmlFor="type" className="text-sm font-medium">Tipo</label>
              <div className="flex gap-4">
                <Button
                  type="button"
                  variant={newCategory.type === "income" ? "default" : "outline"}
                  onClick={() => setNewCategory({
                    ...newCategory,
                    type: "income",
                    color: "#4CAF50",
                    icon: "trending-up"
                  })}
                  className="flex-1"
                >
                  <ArrowUp className="mr-2 h-4 w-4" />
                  Entrata
                </Button>
                <Button
                  type="button"
                  variant={newCategory.type === "expense" ? "default" : "outline"}
                  onClick={() => setNewCategory({
                    ...newCategory,
                    type: "expense",
                    color: "#F44336",
                    icon: "shopping-bag"
                  })}
                  className="flex-1"
                >
                  <ArrowDown className="mr-2 h-4 w-4" />
                  Spesa
                </Button>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Icon Selection */}
              <div className="space-y-2">
                <label htmlFor="newIcon" className="text-sm font-medium">Icona</label>
                <Select
                  value={newCategory.icon}
                  onValueChange={(value) => setNewCategory({ ...newCategory, icon: value })}
                >
                  <SelectTrigger className="flex items-center" id="newIcon">
                    <SelectValue placeholder="Seleziona un'icona">
                      {newCategory.icon && (
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = (LucideIcons as any)[toPascalCase(newCategory.icon)] || LucideIcons.CircleDashed;
                            const iconLabel = commonIcons.find(i => i.value === newCategory.icon)?.label || newCategory.icon;
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
                        const IconComponent = (LucideIcons as any)[toPascalCase(icon.value)] || LucideIcons.CircleDashed;
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
                        );
                      })}
                    </div>
                  </SelectContent>
                </Select>
              </div>

              {/* Color Selection */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Colore</label>
                <ColorPalette
                  selectedColor={newCategory.color}
                  categoryType={newCategory.type}
                  onChange={(color) => setNewCategory({ ...newCategory, color })}
                  className="my-2"
                />
              </div>
            </div>

            {/* Preview */}
            <div className="border rounded-lg p-3 bg-muted/10">
              <CategoryDisplay
                category={{
                  name: newCategory.name || (newCategory.type === "income" ? "Nuova Entrata" : "Nuova Spesa"),
                  type: newCategory.type as CategoryType,
                  icon: newCategory.icon,
                  color: newCategory.color
                }}
                showSubcategories={false}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
              Annulla
            </Button>
            <Button disabled={isSubmitting || !newCategory.name} onClick={handleCreateCategory}>
              {isSubmitting ? "Creando..." : "Crea Categoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create Subcategory Dialog */}
      <Dialog open={isCreateSubcategoryDialogOpen} onOpenChange={setIsCreateSubcategoryDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Nuova Sottocategoria</DialogTitle>
            <DialogDescription>
              Aggiungi una sottocategoria a &quot;{parentCategoryForSub?.name}&quot;.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <label htmlFor="subName" className="text-sm font-medium">Nome Sottocategoria</label>
              <Input
                id="subName"
                value={newSubcategory}
                onChange={(e) => setNewSubcategory(e.target.value)}
                placeholder="Inserisci il nome della sottocategoria..."
              />
            </div>

            {/* Parent Category Preview */}
            {parentCategoryForSub && (
              <div className="border rounded-lg p-3 bg-muted/10">
                <div className="text-xs text-muted-foreground mb-2">Categoria principale:</div>
                <CategoryDisplay
                  category={{
                    name: parentCategoryForSub.name,
                    type: parentCategoryForSub.type as CategoryType,
                    icon: parentCategoryForSub.icon || "",
                    color: parentCategoryForSub.color || ""
                  }}
                  showSubcategories={false}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCreateSubcategoryDialogOpen(false)}>
              Annulla
            </Button>
            <Button disabled={isSubmitting || !newSubcategory} onClick={handleCreateSubcategory}>
              {isSubmitting ? "Creando..." : "Crea Sottocategoria"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

interface CategoriesListProps {
  categories: Category[];
  onEdit: (category: Category) => void;
  onDelete: (category: Category) => void;
  onAddSubcategory: (parentCategory: Category) => void;
}

function CategoriesList({ categories, onEdit, onDelete, onAddSubcategory }: CategoriesListProps) {
  if (categories.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <div className="rounded-full bg-muted p-3">
          <AlertCircle className="h-6 w-6 text-muted-foreground" />
        </div>
        <h3 className="mt-4 text-lg font-medium">Nessuna categoria trovata</h3>
        <p className="mt-2 text-sm text-muted-foreground max-w-sm">
          Non ci sono categorie che corrispondono ai criteri di ricerca o non hai ancora creato categorie.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div
          key={category.id}
          className={cn(
            "group relative p-3 border rounded-lg transition-all hover:shadow-sm",
            category.type === "income" ? "hover:border-green-200" : "hover:border-red-200"
          )}
        >
          <div className="flex items-center justify-between">
            <CategoryDisplay
              category={{
                name: category.name,
                type: category.type as CategoryType,
                icon: category.icon || "",
                color: category.color || "",
                subcategories: category.subcategories
              }}
              showSubcategories={false}
            />

            <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => onAddSubcategory(category)}
                    >
                      <Plus className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent side="top">
                    <p>Aggiungi sottocategoria</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => onEdit(category)}
              >
                <Edit className="h-4 w-4" />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                onClick={() => onDelete(category)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Subcategories */}
          {category.subcategories && category.subcategories.length > 0 && (
            <div className="mt-2 pt-2 pl-4 border-t border-dashed">
              <div className="flex items-center justify-between">
                <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                  <span>Sottocategorie</span>
                  <Badge variant="outline" className="text-xs font-normal">
                    {category.subcategories.length}
                  </Badge>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-70"
                  onClick={() => onAddSubcategory(category)}
                >
                  <Plus className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                {category.subcategories.map((subcat) => (
                  <div key={subcat.id} className="flex items-center justify-between border rounded p-2 bg-muted/30 group/subcat">
                    <span className="text-sm">{subcat.name}</span>
                    <div className="flex items-center gap-1 opacity-0 group-hover/subcat:opacity-100 transition-opacity">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6"
                        onClick={() => onEdit(subcat)}
                      >
                        <Edit className="h-3 w-3" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-6 w-6 text-destructive hover:text-destructive/90 hover:bg-destructive/10"
                        onClick={() => onDelete(subcat)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
} 