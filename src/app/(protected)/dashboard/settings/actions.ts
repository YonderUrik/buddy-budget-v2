"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { hashPassword, verifyPassword } from "@/lib/security/password";

export async function updateUserProfile(formData: {
  name: string;
  email: string;
  primaryCurrency: string;
}) {
  const session = await getServerSession(authOptions);
  
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  
  // Check if email is already in use by another user
  if (formData.email !== session.user.email) {
    const existingUser = await prisma.user.findUnique({
      where: { email: formData.email },
    });
    
    if (existingUser && existingUser.id !== session.user.id) {
      throw new Error("Email già in uso");
    }
  }
  
  // Update user profile
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      name: formData.name,
      email: formData.email,
      primaryCurrency: formData.primaryCurrency,
    },
  });
  
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function changePassword(formData: {
  currentPassword: string;
  newPassword: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
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
    throw new Error("Utente non trovato");
  }
  
  // Verify current password
  const isPasswordValid = await verifyPassword(formData.currentPassword, user.password);
  
  if (!isPasswordValid) {
    throw new Error("Password attuale non corretta");
  }
  
  // Hash and update new password
  const hashedPassword = await hashPassword(formData.newPassword);
  
  await prisma.user.update({
    where: { id: session.user.id },
    data: {
      password: hashedPassword,
    },
  });
  
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function updateCategory(category: {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: string;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  
  // Ensure the category belongs to the user
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: category.id,
      userId: session.user.id,
    },
  });
  
  if (!existingCategory) {
    throw new Error("Categoria non trovata");
  }
  
  // Update category
  await prisma.category.update({
    where: { id: category.id },
    data: {
      name: category.name,
      icon: category.icon,
      color: category.color,
    },
  });
  
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function deleteCategory(categoryId: string) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  
  // Ensure the category belongs to the user
  const existingCategory = await prisma.category.findUnique({
    where: {
      id: categoryId,
      userId: session.user.id,
    },
  });
  
  if (!existingCategory) {
    throw new Error("Categoria non trovata");
  }
  
  // Instead of hard delete, mark as deleted
  await prisma.category.update({
    where: { id: categoryId },
    data: {
      isDeleted: true,
      deletedAt: new Date(),
    },
  });
  
  revalidatePath("/dashboard/settings");
  return { success: true };
}

export async function createCategory(categoryData: {
  name: string;
  type: string;
  icon: string;
  color: string;
  parentId: string | null;
  level: number;
  order: number;
}) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  
  // Create a new category
  const category = await prisma.category.create({
    data: {
      ...categoryData,
      userId: session.user.id,
    },
  });
  
  revalidatePath("/dashboard/settings");
  return { success: true, category };
}

export async function deleteUserAccount() {
  const session = await getServerSession(authOptions);
  
  if (!session?.user?.id) {
    throw new Error("Non autorizzato");
  }
  
  // In a real application, you would want to handle this carefully
  // This might involve deleting related data or using cascade deletes in the database
  
  // Delete the user
  await prisma.user.delete({
    where: { id: session.user.id },
  });
  
  // Redirect to home page after deletion
  redirect("/");
} 