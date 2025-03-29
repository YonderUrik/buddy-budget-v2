import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

// Get all categories for the current user
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }
    
    const categories = await prisma.category.findMany({
      where: { 
        userId: session.user.id,
        isDeleted: false
      },
      orderBy: [
        { level: 'asc' },
        { order: 'asc' }
      ]
    });
    
    return NextResponse.json({ categories });
  } catch (error) {
    console.error("Error fetching categories:", error);
    return NextResponse.json(
      { error: "Errore durante il recupero delle categorie" },
      { status: 500 }
    );
  }
}

// Create a new category
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }
    
    const categoryData = await request.json();
    const { name, type, icon, color, parentId, level, order } = categoryData;

    if (parentId) {
      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      });

      if (!parentCategory || parentCategory.parentId) {
        return NextResponse.json(
          { error: "Il parentId specificato non è una categoria senza parentId" },
          { status: 400 }
        );
      }
    }
    
    // Create a new category
    const category = await prisma.category.create({
      data: {
        name,
        type,
        icon,
        color,
        parentId,
        level,
        order,
        userId: session.user.id,
      },
    });
    
    return NextResponse.json({ success: true, category });
  } catch (error) {
    console.error("Error creating category:", error);
    return NextResponse.json(
      { error: "Errore durante la creazione della categoria" },
      { status: 500 }
    );
  }
} 