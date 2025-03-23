"use client";

import * as React from "react";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import * as LucideIcons from "lucide-react";

// Define the icon categories
const iconCategories = {
  "Finanza": ["banknote", "wallet", "piggy-bank", "credit-card", "landmark", "coins", "trending-up", "trending-down", "receipt", "dollar-sign", "euro", "pound-sterling", "bitcoin"],
  "Casa": ["home", "bed", "sofa", "tv", "lamp", "fridge", "washing-machine", "shower", "bath"],
  "Trasporti": ["car", "bus", "train", "plane", "bike", "truck", "navigation", "map", "map-pin"],
  "Cibo": ["shopping-cart", "shopping-bag", "utensils", "coffee", "wine", "pizza", "apple", "beef", "egg", "fish", "cake"],
  "Salute": ["heart", "activity", "thermometer", "pill", "first-aid", "stethoscope", "hospital"],
  "Intrattenimento": ["film", "music", "headphones", "tv", "gamepad2", "ticket", "party-popper"],
  "Istruzione": ["book", "graduation-cap", "school", "pen-tool", "pencil", "notebook"],
  "Altro": ["zap", "gift", "tag", "package", "phone", "mail", "calendar", "clock", "globe", "users", "user", "briefcase"]
};

// Create a flat list of all icons
const allIcons = Object.values(iconCategories).flat();

type IconPickerProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
};

export function IconPicker({ value, onChange, className }: IconPickerProps) {
  const [open, setOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  // Get the current icon component
  const IconComponent = value ? (LucideIcons as never)[toPascalCase(value)] || LucideIcons.CircleDashed : LucideIcons.CircleDashed;

  // Convert kebab-case to PascalCase for Lucide icon names
  function toPascalCase(str: string) {
    return str
      .split("-")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  // Filter icons based on search query
  const filteredCategories = searchQuery
    ? { "Risultati": allIcons.filter(icon => icon.includes(searchQuery.toLowerCase())) }
    : iconCategories;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("w-full justify-between", className)}
        >
          <div className="flex items-center gap-2">
            <IconComponent className="h-4 w-4" />
            <span>{value || "Seleziona un'icona"}</span>
          </div>
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command>
          <CommandInput 
            placeholder="Cerca un'icona..." 
            value={searchQuery}
            onValueChange={setSearchQuery}
          />
          <CommandList className="max-h-[300px]">
            <CommandEmpty>Nessuna icona trovata.</CommandEmpty>
            {Object.entries(filteredCategories).map(([category, icons]) => (
              <CommandGroup key={category} heading={category}>
                <div className="grid grid-cols-4 gap-1 p-2">
                  {icons.map((icon) => {
                    const IconComp = (LucideIcons as never)[toPascalCase(icon)];
                    return (
                      <CommandItem
                        key={icon}
                        value={icon}
                        onSelect={() => {
                          onChange(icon);
                          setOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex flex-col items-center justify-center p-2 cursor-pointer rounded-md hover:bg-accent"
                      >
                        <div className={cn(
                          "flex h-10 w-10 items-center justify-center rounded-md border",
                          value === icon ? "border-primary bg-primary/10" : "border-transparent"
                        )}>
                          <IconComp className="h-6 w-6" />
                          {value === icon && (
                            <Check className="absolute h-3 w-3 top-1 right-1 text-primary" />
                          )}
                        </div>
                        <span className="text-xs mt-1 text-center truncate w-full">{icon}</span>
                      </CommandItem>
                    );
                  })}
                </div>
              </CommandGroup>
            ))}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
} 