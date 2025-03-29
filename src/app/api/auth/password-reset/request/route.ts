import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { APP_NAME, APP_DOMAIN } from "@/lib/config";

// Inizializza Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Schema di validazione per la richiesta
const requestSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
});

// Funzione per validare e costruire l'indirizzo email del mittente
function getSenderEmail(mail_name: string): string {
  if (!APP_DOMAIN) {
    throw new Error("APP_DOMAIN non è definito nella configurazione");
  }

  // Rimuovi eventuali spazi e caratteri non validi
  const cleanDomain = APP_DOMAIN.trim().toLowerCase();

  // Valida il dominio
  if (!/^[a-zA-Z0-9][a-zA-Z0-9-]{0,61}[a-zA-Z0-9](?:\.[a-zA-Z]{2,})+$/.test(cleanDomain)) {
    throw new Error("Il dominio configurato non è valido");
  }

  return `${mail_name}@${cleanDomain}`;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email } = requestSchema.parse(body);

    // Verifica se l'utente esiste
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    // Se l'utente non esiste, restituisci comunque una risposta positiva per motivi di sicurezza
    if (!user) {
      return NextResponse.json(
        { message: "Se l'email è associata a un account, riceverai un codice di verifica" },
        { status: 200 }
      );
    }

    // Genera un token casuale di 6 cifre
    const token = crypto.randomInt(100000, 999999).toString();

    // Calcola la data di scadenza (30 minuti)
    const expires = new Date();
    expires.setMinutes(expires.getMinutes() + 30);

    const result = await prisma.$transaction(async (tx) => {

      // Elimina eventuali token esistenti per l'utente
      await tx.passwordResetToken.deleteMany({
        where: {
          userId: user.id,
        },
      });

      // Crea un nuovo token di reset
      await tx.passwordResetToken.create({
        data: {
          userId: user.id,
          token,
          expires,
        },
      });

      return { success: true };
    });

    if (!result.success) {
      throw new Error("Errore durante la richiesta di reset della password");
    }

    // Ottieni e valida l'indirizzo email del mittente
    const senderEmail = getSenderEmail("noreply");

    // TODO : Migliorare l'estetica dell'html
    await resend.emails.send({
      from: senderEmail,
      to: email,
      subject: "Codice di verifica per il reset della password",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Recupero Password - ${APP_NAME}</h2>
          <p>Hai richiesto il reset della password per il tuo account ${APP_NAME}.</p>
          <p>Ecco il tuo codice di verifica:</p>
          <div style="background-color: #f4f4f4; padding: 15px; text-align: center; font-size: 24px; letter-spacing: 5px; font-weight: bold; margin: 20px 0;">
            ${token}
          </div>
          <p>Questo codice scadrà tra 30 minuti.</p>
          <p>Se non hai richiesto il reset della password, ignora questa email.</p>
          <p>Grazie,<br>Il team di ${APP_NAME}</p>
        </div>
      `,
    });

    return NextResponse.json(
      { message: "Se l'email è associata a un account, riceverai un codice di verifica" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante la richiesta di reset della password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dati non validi", errors: error.errors },
        { status: 400 }
      );
    }

    // Gestione specifica degli errori di configurazione
    if (error instanceof Error && error.message.includes("APP_DOMAIN")) {
      return NextResponse.json(
        { message: "Errore di configurazione: dominio email non valido" },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { message: "Si è verificato un errore durante la richiesta di reset della password" },
      { status: 500 }
    );
  }
} 