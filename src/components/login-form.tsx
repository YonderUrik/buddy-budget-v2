'use client';

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState, useEffect } from "react"
import { signIn } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Eye, EyeOff } from "lucide-react"
import { APP_NAME } from "@/lib/config";
import Image from "next/image";

export function LoginForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [callbackUrl, setCallbackUrl] = useState<string>("/dashboard")
  const router = useRouter()
  const searchParams = useSearchParams()
  
  // Get callbackUrl from query params or sessionStorage
  useEffect(() => {
    // Priority 1: URL query parameter
    const urlCallbackUrl = searchParams.get("callbackUrl")
    
    // Priority 2: sessionStorage (from expired session)
    const storedCallbackUrl = typeof window !== 'undefined' 
      ? sessionStorage.getItem('callbackUrl') 
      : null
    
    if (urlCallbackUrl) {
      setCallbackUrl(decodeURIComponent(urlCallbackUrl))
    } else if (storedCallbackUrl) {
      setCallbackUrl(storedCallbackUrl)
      // Clear from storage after using it once
      sessionStorage.removeItem('callbackUrl')
    }
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")

    try {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      })

      if (result?.error) {
        setError("Credenziali non valide. Riprova.")
        setIsLoading(false)
        return
      }

      // Redirect to callbackUrl or dashboard on successful login
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      console.error(error)
      setError("Si è verificato un errore durante il login. Riprova.")
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
                <h1 className="text-2xl font-bold">Bentornato</h1>
                <p className="text-muted-foreground text-balance">
                  Accedi al tuo account {APP_NAME}
                </p>
              </div>
              {error && (
                <div className="bg-destructive/15 text-destructive rounded-md p-3 text-sm">
                  {error}
                </div>
              )}
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
                <div className="flex items-center">
                  <Label htmlFor="password">Password</Label>
                  <a
                    href="/auth/password-reset"
                    className="ml-auto text-sm underline-offset-2 hover:underline"
                  >
                    Password dimenticata?
                  </a>
                </div>
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
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? "Accesso in corso..." : "Accedi"}
              </Button>
              <div className="text-center text-sm">
                Non hai un account?{" "}
                <a href="/auth/register" className="underline underline-offset-4">
                  Registrati
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
        Accedendo, accetti i nostri <a href="/terms">Termini di Servizio</a>{" "}
        e la <a href="/privacy">Privacy Policy</a>.
      </div>
    </div>
  )
}
