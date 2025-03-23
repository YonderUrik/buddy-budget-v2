"use client";

import { useEffect, useState } from "react";
// @ts-expect-error - Work around linter error with react-hook-form in TypeScript
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2, KeyRound, Check, X } from "lucide-react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import axios from 'axios';

const passwordFormSchema = z.object({
  currentPassword: z.string().min(1, { message: "La password attuale è obbligatoria" }),
  newPassword: z.string().min(8, { message: "La nuova password deve contenere almeno 8 caratteri" }),
  confirmPassword: z.string().min(1, { message: "Conferma la nuova password" }),
}).refine(data => data.newPassword === data.confirmPassword, {
  message: "Le password non coincidono",
  path: ["confirmPassword"],
});

type PasswordFormValues = z.infer<typeof passwordFormSchema>;

export function PasswordForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  const form = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordFormSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const password = form.watch('newPassword')


  useEffect(() => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    })
  }, [password])

  const passwordStrength = Object.values(passwordValidation).filter(Boolean).length

  // Get password strength indicator color
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  async function handleSubmit(values: PasswordFormValues) {
    form.setError("newPassword", { message: "" })

    // Validate password
    if (passwordStrength < 5) {
      form.setError("newPassword", { message: "La password non soddisfa i requisiti minimi di sicurezza" })
      return
    }

    setIsSubmitting(true);
    try {
      await axios.put('/api/settings/password', {
        currentPassword: values.currentPassword,
        newPassword: values.newPassword,
      });

      form.reset();
      toast.success("Password modificata con successo");
      router.refresh();
    } catch (error: unknown) {
      const errorMessage = (error as { error?: string; message?: string })?.error || (error as Error).message || 'Si è verificato un errore';
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="currentPassword"
          render={({ field }: { field: object }) => (
            <FormItem>
              <FormLabel>Password Attuale</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="newPassword"
          render={({ field }: { field: object }) => (
            <FormItem>
              <FormLabel>Nuova Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Password strength meter */}
        <div className="space-y-2">
          <div className="h-1.5 w-full bg-gray-200 rounded-full overflow-hidden">
            <div
              className={`h-full ${getStrengthColor()} transition-all duration-300`}
              style={{ width: `${(passwordStrength / 5) * 100}%` }}
            />
          </div>

          {/* Password requirements */}
          <ul className="space-y-1 text-xs">
            <li className="flex items-center gap-1.5">
              {passwordValidation.hasMinLength ?
                <Check className="h-3.5 w-3.5 text-green-500" /> :
                <X className="h-3.5 w-3.5 text-red-500" />}
              Almeno 8 caratteri
            </li>
            <li className="flex items-center gap-1.5">
              {passwordValidation.hasUppercase ?
                <Check className="h-3.5 w-3.5 text-green-500" /> :
                <X className="h-3.5 w-3.5 text-red-500" />}
              Almeno una lettera maiuscola (A-Z)
            </li>
            <li className="flex items-center gap-1.5">
              {passwordValidation.hasLowercase ?
                <Check className="h-3.5 w-3.5 text-green-500" /> :
                <X className="h-3.5 w-3.5 text-red-500" />}
              Almeno una lettera minuscola (a-z)
            </li>
            <li className="flex items-center gap-1.5">
              {passwordValidation.hasNumber ?
                <Check className="h-3.5 w-3.5 text-green-500" /> :
                <X className="h-3.5 w-3.5 text-red-500" />}
              Almeno un numero (0-9)
            </li>
            <li className="flex items-center gap-1.5">
              {passwordValidation.hasSpecial ?
                <Check className="h-3.5 w-3.5 text-green-500" /> :
                <X className="h-3.5 w-3.5 text-red-500" />}
              Almeno un carattere speciale
            </li>
          </ul>
        </div>

        <FormField
          control={form.control}
          name="confirmPassword"
          render={({ field }: { field: object }) => (
            <FormItem>
              <FormLabel>Conferma Nuova Password</FormLabel>
              <FormControl>
                <Input type="password" placeholder="••••••••" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button type="submit" disabled={isSubmitting} className="w-full sm:w-auto mt-2">
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Cambiando...
            </>
          ) : (
            <>
              <KeyRound className="mr-2 h-4 w-4" />
              Cambia Password
            </>
          )}
        </Button>
      </form>
    </Form>
  );
} 