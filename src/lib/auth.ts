import { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { compare } from "bcrypt";
import { prisma } from "@/lib/prisma";

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        try {
          const user = await prisma.user.findUnique({
            where: {
              email: credentials.email,
            },
          });

          if (!user) {
            return null;
          }

          const isPasswordValid = await compare(credentials.password, user.password);

          if (!isPasswordValid) {
            return null;
          }

          return {
            id: user.id,
            email: user.email,
            name: user.name,
            hasCompletedOnboarding: user.hasCompletedOnboarding,
            primaryCurrency : user.primaryCurrency
          };
        } catch (error) {
          console.error("Error during authentication:", error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.hasCompletedOnboarding = user.hasCompletedOnboarding;
        token.primaryCurrency = user.primaryCurrency;
      }

      // Permetti l'aggiornamento della sessione quando viene chiamato update()
      if (trigger === "update" && session?.hasCompletedOnboarding !== undefined) {
        token.hasCompletedOnboarding = session.hasCompletedOnboarding;
        token.primaryCurrency = session.primaryCurrency;
      }

      // Check if user still exists and get updated info
      if (token.id) {
        try {
          const user = await prisma.user.findUnique({
            where: { id: token.id as string },
            select: { 
              id: true,
              hasCompletedOnboarding: true,
              primaryCurrency: true,
              name: true,
              email: true
            }
          });
          
          if (!user) {
            // User no longer exists, mark token as invalid
            token.isValid = false;
          } else {
            // Update token with latest user data
            token.isValid = true;
            token.hasCompletedOnboarding = user.hasCompletedOnboarding;
            token.primaryCurrency = user.primaryCurrency;
            token.name = user.name;
            token.email = user.email;
          }
        } catch (error) {
          console.error("Error checking user existence:", error);
        }
      }

      return token;
    },
    async session({ session, token }) {
      // If token is marked as invalid, return empty session but not null
      if (token.isValid === false) {
        return { expires: session.expires };
      }
      
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.hasCompletedOnboarding = token.hasCompletedOnboarding as boolean;
        session.user.primaryCurrency = token.primaryCurrency as string;
        // Update other user fields if they've changed
        if (token.name) session.user.name = token.name as string;
        if (token.email) session.user.email = token.email as string;
      }
      return session;
    },
  },
  pages: {
    signIn: "/auth/login",
    error: "/auth/login",
  },
}; 