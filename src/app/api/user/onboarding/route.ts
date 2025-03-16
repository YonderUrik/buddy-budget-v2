import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

// Schema di validazione per la richiesta di onboarding
const onboardingSchema = z.object({
  language: z.enum(["it", "en", "es", "fr", "de"]),
  primaryCurrency: z.string().min(1),
  liquidityAccounts: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(["checking", "savings", "cash", "other"]),
      balance: z.number().min(0),
    })
  ).min(1),
  categories: z.array(
    z.object({
      name: z.string().min(1),
      type: z.enum(["income", "expense"]),
      icon: z.string().optional(),
      color: z.string().optional(),
      subcategories: z.array(
        z.object({
          name: z.string().min(1),
        })
      ).optional(),
    })
  ).optional(),
});

export async function POST(request: Request) {
  try {
    // Verifica l'autenticazione dell'utente
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json(
        { message: "Non autorizzato" },
        { status: 401 }
      );
    }

    // Ottieni i dati dalla richiesta
    const body = await request.json();
    const { language, primaryCurrency, liquidityAccounts, categories } = onboardingSchema.parse(body);

    // Ottieni l'utente dal database
    const user = await prisma.user.findUnique({
      where: {
        email: session.user.email,
      },
    });

    if (!user) {
      return NextResponse.json(
        { message: "Utente non trovato" },
        { status: 404 }
      );
    }

    // Aggiorna le impostazioni dell'utente
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        settings: {
          language,
          notificationPreferences: user.settings && typeof user.settings === 'object' && 'notificationPreferences' in user.settings 
            ? user.settings.notificationPreferences 
            : { email: true, push: true }
        },
        primaryCurrency,
        hasCompletedOnboarding: true,
      },
    });

    // Crea gli account di liquidità
    for (const account of liquidityAccounts) {
      await prisma.liquidityAccount.create({
        data: {
          userId: user.id,
          name: account.name,
          type: account.type,
          balance: account.balance,
        },
      });
    }

    // Crea le categorie personalizzate se fornite
    if (categories) {
      for (const category of categories) {
        // Crea la categoria principale
        const createdCategory = await prisma.category.create({
          data: {
            userId: user.id,
            name: category.name,
            type: category.type,
            icon: category.icon,
            color: category.color,
            level: 0,
          },
        });
        
        // Crea le sottocategorie se presenti
        if (category.subcategories && category.subcategories.length > 0) {
          for (const subcategory of category.subcategories) {
            await prisma.category.create({
              data: {
                userId: user.id,
                name: subcategory.name,
                type: category.type, // Eredita il tipo dalla categoria principale
                icon: category.icon, // Eredita l'icona dalla categoria principale
                color: category.color, // Eredita il colore dalla categoria principale
                parentId: createdCategory.id,
                level: 1,
              },
            });
          }
        }
      }
   } else {
      console.error("No categories provided")
   }


    return NextResponse.json(
      { message: "Onboarding completato con successo" },
      { status: 200 }
    );
  } catch (error) {
    console.error("Errore durante l'onboarding:", error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { message: "Dati di onboarding non validi", errors: error.errors },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { message: "Si è verificato un errore durante l'onboarding" },
      { status: 500 }
    );
  }
} 