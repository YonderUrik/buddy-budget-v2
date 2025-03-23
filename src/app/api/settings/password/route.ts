import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";
import { hashPassword, verifyPassword } from "@/lib/security/password";

export async function PUT(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  
  try {
    // Parse the request body
    const formData = await request.json();
    const { currentPassword, newPassword } = formData;
    
    // Check if required fields are present
    if (!currentPassword || !newPassword) {
      return NextResponse.json({ error: "Password attuale e nuova password sono obbligatorie" }, { status: 400 });
    }
    
    // Get user with password
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        password: true,
      },
    });
    
    if (!user) {
      return NextResponse.json({ error: "Utente non trovato" }, { status: 404 });
    }
    
    // Verify current password
    const isPasswordValid = await verifyPassword(currentPassword, user.password);
    
    if (!isPasswordValid) {
      return NextResponse.json({ error: "Password attuale non corretta" }, { status: 400 });
    }
    
    // Hash and update new password
    const hashedPassword = await hashPassword(newPassword);
    
    await prisma.user.update({
      where: { id: session.user.id },
      data: {
        password: hashedPassword,
      },
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error changing password:", error);
    return NextResponse.json({ error: "Si è verificato un errore durante il cambio della password" }, { status: 500 });
  }
} 