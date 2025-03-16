import { NextResponse } from 'next/server';
import { Resend } from 'resend';
import { SUPPORT_EMAIL } from '@/lib/config';

// Inizializza Resend con la chiave API
const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
   try {
      // Estrai i dati dalla richiesta
      const { name, email, subject, message } = await request.json();

      // Validazione base
      if (!name || !email || !subject || !message) {
         return NextResponse.json(
            { error: 'Tutti i campi sono obbligatori' },
            { status: 400 }
         );
      }

      // Invia l'email usando Resend
      const { data, error } = await resend.emails.send({
         from: `Contatto ${name} <noreply@${process.env.NEXT_PUBLIC_APP_DOMAIN || 'buddybudget.net'}>`,
         to: "roccafortedaniele28@gmail.com",
         subject: `Nuovo messaggio di contatto: ${subject}`,
         replyTo: email,
         text: `
            Nome: ${name}
            Email: ${email}
            Oggetto: ${subject}

            Messaggio:
            ${message}
         `,
         html: `
            <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2>Nuovo messaggio di contatto</h2>
            <p><strong>Nome:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Oggetto:</strong> ${subject}</p>
            <h3>Messaggio:</h3>
            <p>${message.replace(/\n/g, '<br>')}</p>
            </div>
         `,
      });

      if (error) {
         console.error('Errore nell\'invio dell\'email:', error);
         return NextResponse.json(
            { error: 'Si è verificato un errore durante l\'invio del messaggio' },
            { status: 500 }
         );
      }

      // Risposta di successo
      return NextResponse.json({
         success: true,
         message: `Grazie per averci contattato! Ti risponderemo al più presto all'indirizzo ${email}.`
      });
   } catch (error) {
      console.error('Errore nella gestione della richiesta:', error);
      return NextResponse.json(
         { error: 'Si è verificato un errore durante l\'elaborazione della richiesta' },
         { status: 500 }
      );
   }
} 