import { LoginForm } from "@/components/login-form"
import { APP_NAME } from "@/lib/config"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Login - ${APP_NAME}`,
  description: `Accedi al tuo account ${APP_NAME}`,
}

export default function LoginPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm />
      </div>
    </div>
  )
}
