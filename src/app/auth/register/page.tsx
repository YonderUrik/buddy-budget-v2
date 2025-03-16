import { RegisterForm } from "@/components/register-form"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: "Registrazione - Buddy Budget",
  description: "Crea un nuovo account Buddy Budget",
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