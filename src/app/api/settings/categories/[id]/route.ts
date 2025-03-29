import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

type Props = {
  params: { id: string }
};

// Update a category
export async function PUT(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = params;
    const categoryData = await request.json();
    const { name, icon, color, subcategories } = categoryData;

    // Ensure the category belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria non trovata" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // Update category
      const updatedCategory = await tx.category.update({
        where: { id },
        data: {
          name,
          icon,
          color,
        },
      });

      if (subcategories) {
        for (const subcategory of subcategories) {
          if (!subcategory.id) {
            // Add new subcategory
            await tx.category.create({
              data: { ...subcategory, userId: session?.user?.id }
            });
          } else {
            // Update existing subcategory
            await tx.category.update({
              where: { id: subcategory.id },
              data: {
                name: subcategory.name,
              },
            });
          }
        }
      }

      return { success: true, category: updatedCategory };
    });

    if (!result.success) {
      throw new Error("Errore durante l'aggiornamento della categoria");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error updating category:", error);
    return NextResponse.json(
      { error: "Errore durante l'aggiornamento della categoria" },
      { status: 500 }
    );
  }
}

// Delete a category (soft delete)
export async function DELETE(request: Request, { params }: Props) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non autorizzato" },
        { status: 401 }
      );
    }

    const { id } = params;

    // Ensure the category belongs to the user
    const existingCategory = await prisma.category.findUnique({
      where: {
        id,
        userId: session.user.id,
      },
    });

    if (!existingCategory) {
      return NextResponse.json(
        { error: "Categoria non trovata" },
        { status: 404 }
      );
    }

    const result = await prisma.$transaction(async (tx) => {

      // Delete all child categories
      await tx.category.deleteMany({
        where: { parentId: id },
      });

      // Hard delete the category
      await tx.category.delete({
        where: { id },
      });

      return { success: true };
    });

    if (!result.success) {
      throw new Error("Errore durante l'eliminazione della categoria");
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione della categoria" },
      { status: 500 }
    );
  }
} 