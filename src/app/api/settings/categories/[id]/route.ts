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
    console.log("categoryData", categoryData)
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

    // Update category
    const updatedCategory = await prisma.category.update({
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
          await prisma.category.create({
            data: { ...subcategory, userId: session?.user?.id }
          });
        } else {
          // Update existing subcategory
          await prisma.category.update({
            where: { id: subcategory.id },
            data: {
              name: subcategory.name,
            },
          });
        }
      }
    }



    return NextResponse.json({ success: true, category: updatedCategory });
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

    // Soft delete the category
    await prisma.category.update({
      where: { id },
      data: {
        isDeleted: true,
        deletedAt: new Date(),
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting category:", error);
    return NextResponse.json(
      { error: "Errore durante l'eliminazione della categoria" },
      { status: 500 }
    );
  }
} 