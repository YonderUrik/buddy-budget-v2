'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useRouter } from "next/navigation"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2, Eye, EyeOff } from "lucide-react"
import Image from "next/image";

export function PasswordResetForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [step, setStep] = useState<'request' | 'verify' | 'reset'>('request')
  const [code, setCode] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const router = useRouter()

  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/password-reset/request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Si è verificato un errore durante l'invio del codice")
        setIsLoading(false)
        return
      }

      setSuccess("Codice di verifica inviato alla tua email")
      setStep('verify')
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setError("Si è verificato un errore durante l'invio del codice. Riprova.")
      setIsLoading(false)
    }
  }

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    try {
      const response = await fetch("/api/auth/password-reset/verify", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Codice di verifica non valido")
        setIsLoading(false)
        return
      }

      setSuccess("Codice verificato con successo")
      setStep('reset')
      setIsLoading(false)
    } catch (error) {
      console.error(error)
      setError("Si è verificato un errore durante la verifica del codice. Riprova.")
      setIsLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    if (newPassword !== confirmPassword) {
      setError("Le password non corrispondono")
      setIsLoading(false)
      return
    }

    if (newPassword.length < 8) {
      setError("La password deve contenere almeno 8 caratteri")
      setIsLoading(false)
      return
    }

    try {
      const response = await fetch("/api/auth/password-reset/reset", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, code, password: newPassword }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || "Si è verificato un errore durante il reset della password")
        setIsLoading(false)
        return
      }

      setSuccess("Password reimpostata con successo")
      setTimeout(() => {
        router.push("/auth/login?reset=success")
      }, 2000)
    } catch (error) {
      console.error(error)
      setError("Si è verificato un errore durante il reset della password. Riprova.")
      setIsLoading(false)
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0">
        <CardContent className="grid p-0 md:grid-cols-2">
          <div className="p-6 md:p-8">
            <div className="flex flex-col gap-6">
              <div className="flex flex-col items-center text-center">
                <h1 className="text-2xl font-bold">Recupero Password</h1>
                <p className="text-muted-foreground text-balance">
                  {step === 'request' && "Inserisci la tua email per ricevere un codice di verifica"}
                  {step === 'verify' && "Inserisci il codice di verifica ricevuto via email"}
                  {step === 'reset' && "Inserisci la tua nuova password"}
                </p>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>Errore</AlertTitle>
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {success && (
                <Alert className="bg-green-50 text-green-800 border-green-200">
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertTitle>Successo</AlertTitle>
                  <AlertDescription>{success}</AlertDescription>
                </Alert>
              )}

              {step === 'request' && (
                <form onSubmit={handleRequestReset} className="flex flex-col gap-6">
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
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Invio in corso..." : "Invia codice di verifica"}
                  </Button>
                  <div className="text-center text-sm">
                    Ricordi la password?{" "}
                    <a href="/auth/login" className="underline underline-offset-4">
                      Accedi
                    </a>
                  </div>
                </form>
              )}

              {step === 'verify' && (
                <form onSubmit={handleVerifyCode} className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="code">Codice di verifica</Label>
                    <Input
                      id="code"
                      type="text"
                      placeholder="123456"
                      required
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                    />
                    <p className="text-muted-foreground text-xs">
                      Inserisci il codice di verifica che abbiamo inviato a {email}
                    </p>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Verifica in corso..." : "Verifica codice"}
                  </Button>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setStep('request')}
                      className="underline underline-offset-4 text-sm"
                    >
                      Torna indietro
                    </button>
                  </div>
                </form>
              )}

              {step === 'reset' && (
                <form onSubmit={handleResetPassword} className="flex flex-col gap-6">
                  <div className="grid gap-3">
                    <Label htmlFor="newPassword">Nuova password</Label>
                    <div className="relative">
                      <Input
                        id="newPassword"
                        type={showNewPassword ? "text" : "password"}
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                      >
                        {showNewPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showNewPassword ? "Nascondi password" : "Mostra password"}
                        </span>
                      </button>
                    </div>
                    <p className="text-muted-foreground text-xs">
                      La password deve contenere almeno 8 caratteri
                    </p>
                  </div>
                  <div className="grid gap-3">
                    <Label htmlFor="confirmPassword">Conferma password</Label>
                    <div className="relative">
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        required
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                        <span className="sr-only">
                          {showConfirmPassword ? "Nascondi password" : "Mostra password"}
                        </span>
                      </button>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Reset in corso..." : "Reimposta password"}
                  </Button>
                  <div className="text-center text-sm">
                    <button
                      type="button"
                      onClick={() => setStep('verify')}
                      className="underline underline-offset-4 text-sm"
                    >
                      Torna indietro
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
          <div className="bg-muted relative hidden md:block">
            <Image
              width={1920}
              height={1080}
              src="/placeholder.jpg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
      <div className="text-muted-foreground *:[a]:hover:text-primary text-center text-xs text-balance *:[a]:underline *:[a]:underline-offset-4">
        Per assistenza, contatta il nostro <a href="/support">supporto clienti</a>.
      </div>
    </div>
  )
} 