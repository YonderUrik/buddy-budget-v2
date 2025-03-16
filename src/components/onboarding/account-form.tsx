"use client";

import * as React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash2, CreditCard, PiggyBank, Wallet, Landmark } from "lucide-react";

type AccountFormProps = {
  form: any;
  index: number;
  account: any;
  removeAccount: (index: number) => void;
  currency: string;
  updateAccount: (field: string, value: any) => void;
};

export function AccountForm({ form, index, account, removeAccount, currency, updateAccount }: AccountFormProps) {
  // Get account type icon
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <CreditCard className="h-5 w-5 text-primary" />;
      case "savings":
        return <PiggyBank className="h-5 w-5 text-primary" />;
      case "cash":
        return <Wallet className="h-5 w-5 text-primary" />;
      case "other":
        return <Landmark className="h-5 w-5 text-primary" />;
      default:
        return <CreditCard className="h-5 w-5 text-primary" />;
    }
  };

  // Get account type label
  const getAccountTypeLabel = (type: string) => {
    switch (type) {
      case "checking":
        return "Conto Corrente";
      case "savings":
        return "Conto Risparmio";
      case "cash":
        return "Contanti";
      case "other":
        return "Altro";
      default:
        return "Conto";
    }
  };

  return (
    <Card className="border border-border hover:shadow-md transition-shadow">
      <CardHeader className="pb-3 bg-muted/30">
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg flex items-center gap-2">
            {getAccountTypeIcon(account.type)}
            <span>Conto {index + 1}</span>
          </CardTitle>
          {index > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => removeAccount(index)}
              className="text-destructive hover:text-destructive/90 hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Rimuovi
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <FormLabel>Nome del Conto</FormLabel>
          <Input 
            placeholder="Es. Conto Corrente, Risparmi..." 
            value={account.name} 
            onChange={(e) => updateAccount("name", e.target.value)}
          />
        </div>
        
        <div className="space-y-2">
          <FormLabel>Tipo di Conto</FormLabel>
          <Select 
            value={account.type} 
            onValueChange={(value) => updateAccount("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleziona un tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">
                <div className="flex items-center">
                  <CreditCard className="mr-2 h-4 w-4" />
                  <span>Conto Corrente</span>
                </div>
              </SelectItem>
              <SelectItem value="savings">
                <div className="flex items-center">
                  <PiggyBank className="mr-2 h-4 w-4" />
                  <span>Conto Risparmio</span>
                </div>
              </SelectItem>
              <SelectItem value="cash">
                <div className="flex items-center">
                  <Wallet className="mr-2 h-4 w-4" />
                  <span>Contanti</span>
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center">
                  <Landmark className="mr-2 h-4 w-4" />
                  <span>Altro</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        <div className="space-y-2">
          <FormLabel>Saldo Attuale</FormLabel>
          <div className="relative">
            <Input 
              type="number" 
              min="0" 
              step="0.01" 
              value={account.balance} 
              onChange={(e) => updateAccount("balance", parseFloat(e.target.value) || 0)}
              className="pl-8"
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              {currency === "EUR" && "€"}
              {currency === "USD" && "$"}
              {currency === "GBP" && "£"}
              {currency === "JPY" && "¥"}
              {currency === "CHF" && "Fr"}
              {!["EUR", "USD", "GBP", "JPY", "CHF"].includes(currency) && currency}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
} 