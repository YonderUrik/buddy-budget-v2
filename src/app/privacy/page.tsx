import { Metadata } from "next"
import { PageHeader } from "@/components/ui/page-header"
import { APP_DOMAIN, APP_NAME, PRIVACY_EMAIL } from "@/lib/config"

export const metadata: Metadata = {
  title: `Privacy Policy - ${APP_NAME}`,
  description: `Informativa sulla privacy di ${APP_NAME}`,
}

export default function PrivacyPage() {
  return (
    <div className="container max-w-4xl mx-auto py-12 px-4">
      <PageHeader 
        title="Privacy Policy"
        backUrl="/auth/login"
        backLabel="Accedi"
      />
      
      <div className="prose prose-slate max-w-none">
        <p className="text-muted-foreground mb-6">
          Ultimo aggiornamento: {new Date().toLocaleDateString('it-IT', { year: 'numeric', month: 'long', day: 'numeric' })}
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduzione</h2>
        <p>
          La presente Privacy Policy descrive come {APP_NAME} ("noi", "nostro" o "{APP_NAME}") raccoglie, utilizza e condivide 
          le informazioni personali quando utilizzi il nostro sito web {APP_DOMAIN} e i servizi correlati (collettivamente, il "Servizio").
        </p>
        <p>
          Rispettiamo la tua privacy e ci impegniamo a proteggere le tue informazioni personali. Ti invitiamo a leggere attentamente 
          questa Privacy Policy per comprendere le nostre pratiche riguardo ai tuoi dati personali.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">2. Informazioni che Raccogliamo</h2>
        <p>
          <strong>Informazioni fornite direttamente:</strong> Quando ti registri al nostro Servizio, raccogliamo informazioni come 
          nome, indirizzo email e password. Quando utilizzi il Servizio, raccogliamo anche dati finanziari come transazioni, budget, 
          conti e investimenti che scegli di inserire.
        </p>
        <p>
          <strong>Informazioni raccolte automaticamente:</strong> Raccogliamo automaticamente alcune informazioni quando utilizzi 
          il nostro Servizio, inclusi dati di utilizzo, informazioni sul dispositivo e indirizzo IP.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">3. Come Utilizziamo le Tue Informazioni</h2>
        <p>Utilizziamo le informazioni raccolte per:</p>
        <ul className="list-disc pl-6 mb-4">
          <li>Fornire, mantenere e migliorare il nostro Servizio</li>
          <li>Elaborare e completare transazioni</li>
          <li>Inviare informazioni tecniche, aggiornamenti e messaggi di supporto</li>
          <li>Rispondere alle tue richieste e fornire assistenza clienti</li>
          <li>Monitorare e analizzare tendenze, utilizzo e attività connesse al nostro Servizio</li>
          <li>Prevenire frodi e abusi e garantire la sicurezza del nostro Servizio</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">4. Condivisione delle Informazioni</h2>
        <p>
          Non vendiamo, affittiamo o condividiamo le tue informazioni personali con terze parti, tranne nei seguenti casi:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Con il tuo consenso</li>
          <li>Con fornitori di servizi che ci aiutano a fornire il Servizio</li>
          <li>Per conformarci a obblighi legali</li>
          <li>Per proteggere i diritti, la proprietà o la sicurezza di {APP_NAME}, dei nostri utenti o del pubblico</li>
        </ul>

        <h2 className="text-2xl font-semibold mt-8 mb-4">5. Sicurezza dei Dati</h2>
        <p>
          Adottiamo misure di sicurezza ragionevoli per proteggere le tue informazioni personali da perdita, uso improprio, 
          accesso non autorizzato, divulgazione, alterazione e distruzione. Tuttavia, nessun metodo di trasmissione su Internet 
          o metodo di archiviazione elettronica è sicuro al 100%.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">6. I Tuoi Diritti</h2>
        <p>
          A seconda della tua giurisdizione, potresti avere determinati diritti riguardo ai tuoi dati personali, tra cui:
        </p>
        <ul className="list-disc pl-6 mb-4">
          <li>Accedere ai dati personali che abbiamo su di te</li>
          <li>Richiedere la correzione di dati inaccurati</li>
          <li>Richiedere la cancellazione dei tuoi dati</li>
          <li>Opporti al trattamento dei tuoi dati</li>
          <li>Richiedere la limitazione del trattamento dei tuoi dati</li>
          <li>Richiedere la portabilità dei tuoi dati</li>
        </ul>
        <p>
          Per esercitare questi diritti, contattaci all'indirizzo email indicato nella sezione "Contatti".
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookie e Tecnologie Simili</h2>
        <p>
          Utilizziamo cookie e tecnologie di tracciamento simili per raccogliere e archiviare informazioni quando utilizzi il nostro Servizio. 
          Puoi impostare il tuo browser per rifiutare tutti o alcuni cookie, o per avvisarti quando i siti web impostano o accedono ai cookie.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">8. Modifiche alla Privacy Policy</h2>
        <p>
          Possiamo aggiornare la nostra Privacy Policy di tanto in tanto. Ti informeremo di eventuali modifiche pubblicando la nuova 
          Privacy Policy su questa pagina e, se le modifiche sono significative, ti invieremo una notifica via email.
        </p>

        <h2 className="text-2xl font-semibold mt-8 mb-4">9. Contatti</h2>
        <p>
          Per domande o preoccupazioni riguardo alla nostra Privacy Policy o alle nostre pratiche relative ai dati, contattaci all'indirizzo 
          <a href={`mailto:${PRIVACY_EMAIL}`} className="text-primary hover:underline"> {PRIVACY_EMAIL}</a> o visita la nostra 
          <a href="/support" className="text-primary hover:underline"> pagina di supporto</a>.
        </p>
      </div>
    </div>
  )
} 