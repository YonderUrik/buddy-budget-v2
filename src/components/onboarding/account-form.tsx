"use client";

import * as React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { FormLabel } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CreditCard, PiggyBank, Wallet, Landmark, AlertCircle, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

type AccountFormProps = {
  account: object;
  removeAccount: (index: number) => void;
  currency: string;
  updateAccount: (field: string, value: string) => void;
};

export function AccountForm({ account, currency, updateAccount }: AccountFormProps) {
  const [isFocused, setIsFocused] = React.useState<string | null>(null);
  const [isValid, setIsValid] = React.useState({
    name: true,
    balance: true
  });

  React.useEffect(() => {
    setIsValid({
      name: account.name.length > 0,
      balance: account.balance >= 0
    });
  }, [account.name, account.balance]);

  // Get account type icon
  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case "checking":
        return <CreditCard className="h-5 w-5" />;
      case "savings":
        return <PiggyBank className="h-5 w-5" />;
      case "cash":
        return <Wallet className="h-5 w-5" />;
      case "other":
        return <Landmark className="h-5 w-5" />;
      default:
        return <CreditCard className="h-5 w-5" />;
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
    <Card className={cn(
      "border border-border transition-all duration-200",
      isFocused ? "ring-2 ring-primary/50 shadow-lg" : "hover:shadow-md"
    )}>
      <CardContent className="space-y-4 pt-4">
        <div className="space-y-2">
          <FormLabel className="flex items-center justify-between">
            <span>Nome del Conto</span>
            {isFocused === 'name' && (
              <span className="text-xs font-normal text-muted-foreground">
                {account.name.length ? `${account.name.length} caratteri` : 'Campo obbligatorio'}
              </span>
            )}
          </FormLabel>
          <div className="relative">
            <Input
              placeholder="Es. Conto Corrente, Risparmi..."
              value={account.name}
              onChange={(e) => updateAccount("name", e.target.value)}
              onFocus={() => setIsFocused('name')}
              onBlur={() => setIsFocused(null)}
              className={cn(
                "pr-8",
                !isValid.name && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {!isValid.name && <AlertCircle className="h-4 w-4 text-destructive" />}
              {isValid.name && account.name.length > 0 && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          {!isValid.name && (
            <p className="text-xs text-destructive">Il nome del conto è obbligatorio</p>
          )}
        </div>

        <div className="space-y-2">
          <FormLabel>Tipo di Conto</FormLabel>
          <Select
            value={account.type}
            onValueChange={(value) => updateAccount("type", value)}
          >
            <SelectTrigger
              className="flex items-center"
              onFocus={() => setIsFocused('type')}
              onBlur={() => setIsFocused(null)}
            >
              <SelectValue placeholder="Seleziona un tipo">
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "p-1 rounded-full text-white",
                  )}>
                    {getAccountTypeIcon(account.type)}
                  </div>
                  <span>{getAccountTypeLabel(account.type)}</span>
                </div>
              </SelectValue>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="checking">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full text-white">
                    <CreditCard className="h-4 w-4" />
                  </div>
                  <span>Conto Corrente</span>
                </div>
              </SelectItem>
              <SelectItem value="savings">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full text-white">
                    <PiggyBank className="h-4 w-4" />
                  </div>
                  <span>Conto Risparmio</span>
                </div>
              </SelectItem>
              <SelectItem value="cash">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full text-white">
                    <Wallet className="h-4 w-4" />
                  </div>
                  <span>Contanti</span>
                </div>
              </SelectItem>
              <SelectItem value="other">
                <div className="flex items-center gap-2">
                  <div className="p-1 rounded-full text-white">
                    <Landmark className="h-4 w-4" />
                  </div>
                  <span>Altro</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <FormLabel className="flex items-center justify-between">
            <span>Saldo Attuale</span>
            {isFocused === 'balance' && (
              <span className="text-xs font-normal text-muted-foreground">
                Importo in {currency}
              </span>
            )}
          </FormLabel>
          <div className="relative">
            <Input
              type="number"
              min="0"
              step="0.01"
              value={account.balance}
              onChange={(e) => updateAccount("balance", parseFloat(e.target.value) || 0)}
              onFocus={() => setIsFocused('balance')}
              onBlur={() => setIsFocused(null)}
              className={cn(
                "pl-8 pr-8",
                !isValid.balance && "border-destructive focus-visible:ring-destructive"
              )}
            />
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-muted-foreground">
              {currency === "EUR" && "€"}
              {currency === "USD" && "$"}
              {currency === "GBP" && "£"}
              {currency === "JPY" && "¥"}
              {currency === "CHF" && "Fr"}
              {!["EUR", "USD", "GBP", "JPY", "CHF"].includes(currency) && currency}
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2">
              {!isValid.balance && <AlertCircle className="h-4 w-4 text-destructive" />}
              {isValid.balance && <CheckCircle2 className="h-4 w-4 text-green-500" />}
            </div>
          </div>
          {!isValid.balance && (
            <p className="text-xs text-destructive">Il saldo deve essere maggiore o uguale a 0</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
} 