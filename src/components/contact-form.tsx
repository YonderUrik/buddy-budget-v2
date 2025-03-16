'use client'

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { SUPPORT_EMAIL } from "@/lib/config"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface ContactFormProps {
  className?: string
}

export function ContactForm({ className }: ContactFormProps) {
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [subject, setSubject] = useState("")
  const [message, setMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess("")

    // Validazione base
    if (!name || !email || !subject || !message) {
      setError("Tutti i campi sono obbligatori")
      setIsLoading(false)
      return
    }

    try {
      // Invia i dati all'API
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, subject, message }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Si è verificato un errore durante l\'invio del messaggio');
        setIsLoading(false);
        return;
      }
      
      // Resetta il form
      setName("")
      setEmail("")
      setSubject("")
      setMessage("")
      
      // Mostra messaggio di successo
      setSuccess(data.message || `Grazie per averci contattato! Ti risponderemo al più presto all'indirizzo ${email}.`)
      setIsLoading(false)
    } catch (error) {
      setError("Si è verificato un errore durante l'invio del messaggio. Riprova più tardi.")
      setIsLoading(false)
    }
  }

  return (
    <div className={className}>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Errore</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      
      {success && (
        <Alert className="mb-4 border-green-500 text-green-500">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>Messaggio inviato</AlertTitle>
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}
      
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">Nome</label>
            <Input 
              id="name" 
              placeholder="Il tuo nome" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">Email</label>
            <Input 
              id="email" 
              type="email" 
              placeholder="La tua email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>
        <div>
          <label htmlFor="subject" className="block text-sm font-medium mb-1">Oggetto</label>
          <Input 
            id="subject" 
            placeholder="Oggetto del messaggio" 
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1">Messaggio</label>
          <Textarea 
            id="message" 
            placeholder="Descrivi il tuo problema o la tua domanda" 
            rows={5} 
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            required
          />
        </div>
        <div className="text-sm text-muted-foreground">
          Puoi anche contattarci direttamente all'indirizzo{" "}
          <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">
            {SUPPORT_EMAIL}
          </a>
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? "Invio in corso..." : "Invia messaggio"}
        </Button>
      </form>
    </div>
  )
} 