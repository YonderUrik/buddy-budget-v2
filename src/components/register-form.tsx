'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Eye, EyeOff, Check, X } from "lucide-react"
import { APP_NAME } from "@/lib/config";
import Image from "next/image";

export function RegisterForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const router = useRouter()

  // Password validation states
  const [passwordValidation, setPasswordValidation] = useState({
    hasMinLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false
  })

  // Update password validation on password change
  useEffect(() => {
    setPasswordValidation({
      hasMinLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password)
    })
  }, [password])

  // Calculate password strength
  const passwordStrength = Object.values(passwordValidation).filter(Boolean).length

  // Get password strength indicator color
  const getStrengthColor = () => {
    if (passwordStrength <= 2) return "bg-red-500"
    if (passwordStrength <= 4) return "bg-yellow-500"
    return "bg-green-500"
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    // Validate password
    if (passwordStrength < 5) {
      setError("La password non soddisfa i requisiti minimi di sicurezza")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name,
          email,
          password,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Si è verificato un errore durante la registrazione")
        setIsLoading(false)
        return
      }

      // Redirect to login page on successful registration
      router.push("/auth/login?registered=true")
    } catch (err) {
      setError("Si è verificato un errore durante la registrazione. Riprova.")
      console.error("Registration error:", err)
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form className="p-6 md:p-8" onSubmit={handleSubmit}>
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Crea un account</h1>
                <p className="text-muted-foreground text-balance">
                  Registrati per iniziare a usare {APP_NAME}
                </p>
              </div>
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
              <div className="grid gap-3">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Mario Rossi"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div className="grid gap-3">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                    <span className="sr-only">
                      {showPassword ? "Nascondi password" : "Mostra password"}
                    </span>
                  </button>
                </div>

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
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Registrazione in corso..." : "Registrati"}
              </Button>
              <div className="text-center text-sm">
                Hai già un account?{" "}
                <a href="/auth/login" className="underline underline-offset-4">
                  Accedi
                </a>
              </div>
            </div>
          </form>
          <div className="bg-muted relative hidden md:block">
            <Image
              src="/placeholder.jpg"
              width={1920}
              height={1080}
              alt="Image"
              className="absolute inset-0 h-full w-full object-fit dark:brightness-[0.5]"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Registrandoti, accetti i nostri <a href="/terms">Termini di Servizio</a>{" "}
        e la <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )
} 