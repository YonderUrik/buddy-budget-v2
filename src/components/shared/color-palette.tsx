"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// Preset colors for categories
export const incomeColors = [
  "#4CAF50", // Green
  "#8BC34A", // Light Green
  "#009688", // Teal
  "#00BCD4", // Cyan
  "#03A9F4", // Light Blue
  "#2196F3", // Blue
  "#3F51B5", // Indigo
];

export const expenseColors = [
  "#F44336", // Red
  "#E91E63", // Pink
  "#9C27B0", // Purple
  "#673AB7", // Deep Purple
  "#FF5722", // Deep Orange
  "#FF9800", // Orange
  "#795548", // Brown
];

// Additional colors that can be used for both
export const neutralColors = [
  "#607D8B", // Blue Grey
  "#9E9E9E", // Grey
  "#FFEB3B", // Yellow
  "#CDDC39", // Lime
  "#FFC107", // Amber
];

export const allColors = [...incomeColors, ...expenseColors, ...neutralColors];

interface ColorPaletteProps {
  selectedColor: string;
  categoryType?: "income" | "expense";
  onChange: (color: string) => void;
  className?: string;
}

export function ColorPalette({ 
  selectedColor, 
  categoryType, 
  onChange, 
  className 
}: ColorPaletteProps) {
  // Determine which colors to show based on category type
  const colors = categoryType === "income" 
    ? [...incomeColors, ...neutralColors]
    : categoryType === "expense" 
      ? [...expenseColors, ...neutralColors]
      : allColors;
  
  return (
    <div className={cn("flex flex-wrap gap-2", className)}>
      {colors.map((color, index) => (
        <Button
          key={index}
          type="button"
          variant="outline"
          className={cn(
            "w-8 h-8 p-0 rounded-full border-2",
            color === selectedColor ? "border-primary" : "border-muted"
          )}
          style={{ backgroundColor: color }}
          onClick={() => onChange(color)}
          aria-label={`Select color ${color}`}
        />
      ))}
    </div>
  );
} 