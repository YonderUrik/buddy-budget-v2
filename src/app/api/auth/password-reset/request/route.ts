import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { Resend } from "resend";
import crypto from "crypto";
import { APP_NAME } from "@/lib/config";

// Inizializza Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Schema di validazione per la richiesta
const requestSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
});

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

    // Elimina eventuali token esistenti per l'utente
    await prisma.passwordResetToken.deleteMany({
      where: {
        userId: user.id,
      },
    });

    // Crea un nuovo token di reset
    await prisma.passwordResetToken.create({
      data: {
        userId: user.id,
        token,
        expires,
      },
    });

    // Invia l'email con il codice di verifica
    await resend.emails.send({
      from: "noreply@buddybudget.net",
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
    
    return NextResponse.json(
      { message: "Si è verificato un errore durante la richiesta di reset della password" },
      { status: 500 }
    );
  }
} 