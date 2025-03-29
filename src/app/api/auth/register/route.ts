/* eslint-disable @typescript-eslint/no-unused-vars */
import { NextResponse } from "next/server";
import { hash } from "bcrypt";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema di validazione per la richiesta
const registerSchema = z.object({
  name: z.string().min(2, { message: "Il nome deve avere almeno 2 caratteri" }),
  email: z.string().email({ message: "Email non valida" }),
  password: z.string().min(8, { message: "La password deve avere almeno 8 caratteri" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, email, password } = registerSchema.parse(body);

    // Verifica se l'utente esiste già
    const existingUser = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (existingUser) {
      return NextResponse.json(
        { message: "Email già in uso" },
        { status: 409 }
      );
    }

    // Hash della password
    const hashedPassword = await hash(password, 10);

    // Crea un nuovo utente
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        settings: {
          language: "it",
        },
        primaryCurrency: "EUR",
        hasCompletedOnboarding: false,
      },
    });

    // Ritorna l'utente senza la password
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { user: userWithoutPassword, message: "Utente creato con successo" },
      { status: 201 }
    );
  } catch (error) {
    console.error("Errore durante la registrazione:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dati di registrazione non validi", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Si è verificato un errore durante la registrazione" },
      { status: 500 }
    );
  }
} 