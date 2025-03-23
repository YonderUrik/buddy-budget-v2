"use client";

import * as React from "react";
import * as LucideIcons from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

// Convert kebab-case to PascalCase for Lucide icon names
function toPascalCase(str: string) {
  return str
    .split("-")
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join("");
}

export type CategoryType = "income" | "expense";

export type SubcategoryType = {
  name: string;
  id?: string;
};

export type CategoryItem = {
  id?: string;
  name: string;
  type: CategoryType;
  icon: string;
  color: string;
  subcategories?: SubcategoryType[];
};

interface CategoryDisplayProps {
  category: CategoryItem;
  showSubcategories?: boolean;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

export function CategoryDisplay({
  category,
  showSubcategories = false,
  compact = false,
  onClick,
  className
}: CategoryDisplayProps) {
  const IconComponent: React.FC<React.SVGProps<SVGSVGElement>> = (LucideIcons as never)[toPascalCase(category.icon)] || LucideIcons.CircleDashed;
  const hasSubcategories = category.subcategories && category.subcategories.length > 0;
  
  return (
    <Card 
      className={cn(
        `border-l-4 ${category.type === 'income' ? 'border-l-green-500' : 'border-l-red-500'}`,
        onClick ? "cursor-pointer hover:shadow-md transition-shadow" : "",
        className
      )}
      onClick={onClick}
    >
      <CardContent className={compact ? "p-3" : "p-4"}>
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center justify-center h-10 w-10 rounded-full flex-shrink-0" 
            style={{ backgroundColor: category.color }}
          >
            <IconComponent className="h-5 w-5 text-white" />
          </div>
          <div className="flex-grow">
            <div className="flex items-center justify-between">
              <p className={cn("font-medium", compact ? "text-sm" : "text-base")}>
                {category.name}
              </p>
              {compact && hasSubcategories && (
                <Badge variant="outline" className="text-xs">
                  {category.subcategories?.length} sottocategorie
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              {category.type === "income" ? "Entrata" : "Spesa"}
              {!compact && hasSubcategories && 
                ` • ${category.subcategories?.length} sottocategorie`}
            </p>
          </div>
        </div>
        
        {showSubcategories && hasSubcategories && (
          <div className="mt-3 pl-12 space-y-1">
            {category.subcategories?.map((subcategory, index) => (
              <div key={subcategory.id || index} className="flex items-center justify-between">
                <p className="text-sm">{subcategory.name}</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
} 