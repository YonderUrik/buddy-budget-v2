import { RegisterForm } from "@/components/register-form"
import { APP_NAME } from "@/lib/config"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Registrazione - ${APP_NAME}`,
  description: `Crea un nuovo account ${APP_NAME}`,
}

export default function RegisterPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <RegisterForm />
      </div>
    </div>
  )
} 