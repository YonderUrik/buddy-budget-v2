import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";

// Schema di validazione per la richiesta
const verifySchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  code: z.string().min(6).max(6),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code } = verifySchema.parse(body);

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Codice di verifica non valido" },
        { status: 400 }
      );
    }

    // Trova il token di reset
    const resetToken = await prisma.passwordResetToken.findFirst({
      where: {
        userId: user.id,
        token: code,
        expires: {
          gt: new Date(),
        },
      },
    });

    if (!resetToken) {
      return NextResponse.json(
        { message: "Codice di verifica non valido o scaduto" },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Codice di verifica valido" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante la verifica del codice:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dati non validi", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Si è verificato un errore durante la verifica del codice" },
      { status: 500 }
    );
  }
} 