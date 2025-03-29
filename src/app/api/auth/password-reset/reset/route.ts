import { NextResponse } from "next/server";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { hash } from "bcrypt";

// Schema di validazione per la richiesta
const resetSchema = z.object({
  email: z.string().email({ message: "Email non valida" }),
  code: z.string().min(6).max(6),
  password: z.string().min(8, { message: "La password deve avere almeno 8 caratteri" }),
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, code, password } = resetSchema.parse(body);

    // Trova l'utente
    const user = await prisma.user.findUnique({
      where: {
        email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Impossibile reimpostare la password" },
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

    // Hash della nuova password
    const hashedPassword = await hash(password, 10);

    const result = await prisma.$transaction(async (tx) => {
      // Aggiorna la password dell'utente
      await tx.user.update({
        where: {
          id: user.id,
        },
        data: {
          password: hashedPassword,
        },
      });

      // Elimina il token di reset
      await tx.passwordResetToken.delete({
        where: {
          id: resetToken.id,
        },
      });

      return { success: true };
    });

    if (!result.success) {
      throw new Error("Errore durante il reset della password");
    }

    return NextResponse.json(
      { message: "Password reimpostata con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante il reset della password:", error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dati non validi", errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: "Si è verificato un errore durante il reset della password" },
      { status: 500 }
    );
  }
} 