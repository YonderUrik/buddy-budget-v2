import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function PUT(request: Request) {
  // Check authentication
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }
  
  try {
    // Parse the request body
    const formData = await request.json();
    const { name } = formData;
    
    // Check if required fields are present
    if (!name) {
      return NextResponse.json({ error: "Il campo nome è obbligatorio" }, { status: 400 });
    }
    
    // Update user profile
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
      },
      select: {
        id: true,
        name: true,
        email: true,
        primaryCurrency: true,
      }
    });

    return NextResponse.json({
      success: true,
      user: updatedUser
    });
  } catch (error) {
    console.error("Error updating profile:", error);
    return NextResponse.json({ error: "Si è verificato un errore durante l'aggiornamento del profilo" }, { status: 500 });
  }
} 