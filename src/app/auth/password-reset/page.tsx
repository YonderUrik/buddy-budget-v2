import { PasswordResetForm } from "@/components/password-reset-form"
import { APP_NAME } from "@/lib/config"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: `Recupero Password - ${APP_NAME}`,
  description: `Recupera la password del tuo account ${APP_NAME}`,
}

export default function PasswordResetPage() {
  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-3xl">
        <PasswordResetForm />
      </div>
    </div>
  )
} 