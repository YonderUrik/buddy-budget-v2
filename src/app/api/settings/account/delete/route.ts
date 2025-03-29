import { getServerSession } from "next-auth/next";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { authOptions } from "@/lib/auth";

export async function DELETE() {
  // Check authentication
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorizzato" }, { status: 401 });
  }

  try {
    const result = await prisma.$transaction(async (tx) => {

      // First, remove all parent-child relationships between categories
      await tx.category.updateMany({
        where: { userId: session.user.id },
        data: { parentId: null }
      });

      // Delete all password reset tokens for this user (automatically handled via cascade)

      // Delete the user (which will cascade delete all related data)
      await tx.user.delete({
        where: { id: session.user.id },
      });

      return { success: true };
    });

    if (!result.success) {
      throw new Error("Errore durante l'eliminazione dell'account");
    }

    // No need to explicitly delete session/JWT as they are stored in cookies
    // The session will be invalidated when the client is redirected to home

    // Set headers to clear auth cookies
    const headers = new Headers();
    headers.append('Set-Cookie', `next-auth.session-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    headers.append('Set-Cookie', `next-auth.csrf-token=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);
    headers.append('Set-Cookie', `next-auth.callback-url=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0`);

    return NextResponse.json({
      success: true,
      redirectUrl: "/" // Redirect to home page after successful deletion
    }, { headers });
  } catch (error) {
    console.error("Error deleting account:", error);
    return NextResponse.json({ error: "Si è verificato un errore durante l'eliminazione dell'account" }, { status: 500 });
  }
} 