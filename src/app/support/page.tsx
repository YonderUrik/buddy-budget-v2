import * as React from "react"
import { Metadata } from "next"
import { PageHeader } from "@/components/ui/page-header"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { ContactForm } from "@/components/contact-form"
import { APP_NAME } from "@/lib/config"
import Link from "next/link"

export const metadata: Metadata = {
   title: `Supporto Clienti - ${APP_NAME}`,
   description: `Assistenza e supporto per gli utenti di ${APP_NAME}`,
}

export default function SupportPage() {
   return (
      <div className="container max-w-6xl mx-auto py-12 px-4">
         <PageHeader
            title="Supporto Clienti"
            description="Come possiamo aiutarti oggi?"
            backUrl="/auth/login"
            backLabel="Accedi"
         />

         <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
            <div>
               <h2 className="text-2xl font-semibold mb-6">Domande Frequenti</h2>
               <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value="item-1">
                     <AccordionTrigger>Come posso creare un account?</AccordionTrigger>
                     <AccordionContent>
                        Per creare un account, vai alla pagina di registrazione e inserisci il tuo nome, indirizzo email e una password sicura.
                     </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-2">
                     <AccordionTrigger>Come posso reimpostare la mia password?</AccordionTrigger>
                     <AccordionContent>
                        Se hai dimenticato la password, vai alla pagina di login e clicca su &quot;Password dimenticata?&quot;.
                        Inserisci il tuo indirizzo email e ti invieremo un codice di verifica per reimpostare la password.
                     </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="item-5">
                     <AccordionTrigger>I miei dati finanziari sono sicuri?</AccordionTrigger>
                     <AccordionContent>
                        Sì, la sicurezza dei tuoi dati è la nostra priorità. Utilizziamo la crittografia SSL per proteggere tutte le
                        comunicazioni e i dati sensibili. I tuoi dati finanziari sono archiviati in modo sicuro e non vengono mai
                        condivisi con terze parti senza il tuo consenso esplicito.
                     </AccordionContent>
                  </AccordionItem>
               </Accordion>
            </div>

            <div id="contact-form">
               <h2 className="text-2xl font-semibold mb-6">Contattaci</h2>
               <ContactForm />
            </div>
         </div>

         <div className="text-center">
            <h2 className="text-2xl font-semibold mb-4">Risorse Utili</h2>
            <div className="flex flex-wrap justify-center gap-4">
               <Link href="/terms" className="text-primary hover:underline">Termini di Servizio</Link>
               <Link href="/privacy" className="text-primary hover:underline">Privacy Policy</Link>
               <Link href="/" className="text-primary hover:underline">Home</Link>
            </div>
         </div>
      </div>
   )
}