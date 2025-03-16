import { Metadata } from "next"
import { PageHeader } from "@/components/ui/page-header"
import { APP_DOMAIN, APP_NAME, SUPPORT_EMAIL } from "@/lib/config"

export const metadata: Metadata = {
  title: `Termini di Servizio - ${APP_NAME}`,
  description: `Termini e condizioni di utilizzo di ${APP_NAME}`,
}

export default function TermsPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <PageHeader 
        title="Termini di Servizio"
        backUrl="/auth/login"
        backLabel="Accedi"
      />
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduzione</h2>
        <p>
          Benvenuto su {APP_NAME}. I presenti Termini di Servizio ("Termini") regolano l'utilizzo della nostra applicazione web, 
          inclusi tutti i contenuti, le funzionalità e i servizi offerti tramite {APP_DOMAIN} (il "Servizio").
        </p>
        <p>
          Utilizzando il nostro Servizio, accetti di essere vincolato da questi Termini. Se non accetti questi Termini, 
          ti preghiamo di non utilizzare il nostro Servizio.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Descrizione del Servizio</h2>
        <p>
          {APP_NAME} è un'applicazione di gestione finanziaria personale che consente agli utenti di tracciare le proprie 
          finanze, creare budget, monitorare spese e investimenti, e visualizzare report finanziari.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Account Utente</h2>
        <p>
          Per utilizzare alcune funzionalità del nostro Servizio, potrebbe essere necessario creare un account. 
          Sei responsabile di mantenere la riservatezza delle tue credenziali di accesso e di tutte le attività che si verificano sotto il tuo account.
        </p>
        <p>
          Ti impegni a fornire informazioni accurate, aggiornate e complete durante il processo di registrazione e a mantenere 
          tali informazioni aggiornate. L'uso non autorizzato del tuo account deve essere comunicato immediatamente.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Contenuti dell'Utente</h2>
        <p>
          Il nostro Servizio consente di inserire, caricare e condividere contenuti come dati finanziari, transazioni e budget. 
          Mantieni tutti i diritti sui tuoi contenuti, ma ci concedi una licenza per utilizzarli al fine di fornirti il Servizio.
        </p>
        <p>
          Ti impegni a non caricare contenuti che violino diritti di terzi o che siano illegali, diffamatori, osceni o altrimenti discutibili.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Privacy</h2>
        <p>
          La tua privacy è importante per noi. Consulta la nostra <a href="/privacy" className="text-primary hover:underline">Privacy Policy</a> per 
          comprendere come raccogliamo, utilizziamo e proteggiamo i tuoi dati personali.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. Limitazioni di Responsabilità</h2>
        <p>
          Il nostro Servizio è fornito "così com'è" e "come disponibile", senza garanzie di alcun tipo, espresse o implicite. 
          Non garantiamo che il Servizio sarà ininterrotto, tempestivo, sicuro o privo di errori.
        </p>
        <p>
          In nessun caso saremo responsabili per danni indiretti, incidentali, speciali, consequenziali o punitivi, 
          inclusi perdita di profitti, dati, uso o altre perdite intangibili.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Modifiche ai Termini</h2>
        <p>
          Ci riserviamo il diritto di modificare o sostituire questi Termini in qualsiasi momento. Le modifiche sostanziali 
          saranno notificate tramite il nostro Servizio o via email. L'uso continuato del Servizio dopo tali modifiche 
          costituisce l'accettazione dei nuovi Termini.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Contatti</h2>
        <p>
          Per domande sui presenti Termini, contattaci all'indirizzo <a href={`mailto:${SUPPORT_EMAIL}`} className="text-primary hover:underline">{SUPPORT_EMAIL}</a> 
          o visita la nostra <a href="/support" className="text-primary hover:underline">pagina di supporto</a>.
        </p>
      </div>
    </div>
  )
} 