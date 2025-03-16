import { PasswordResetForm } from "@/components/password-reset-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Recupero Password - Buddy Budget",
  description: "Recupera la password del tuo account Buddy Budget",
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