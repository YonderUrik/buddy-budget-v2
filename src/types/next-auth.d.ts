import NextAuth, { DefaultSession } from "next-auth";
import { JWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Estende il tipo User di default
   */
  interface User {
    id: string;
    hasCompletedOnboarding: boolean;
    // Altri campi personalizzati...
  }

  /**
   * Estende la sessione di default
   */
  interface Session {
    user: {
      id: string;
      hasCompletedOnboarding: boolean;
    } & DefaultSession["user"];
  }
}

declare module "next-auth/jwt" {
  /**
   * Estende l'oggetto JWT con campi personalizzati
   */
  interface JWT {
    id: string;
    hasCompletedOnboarding: boolean;
  }
} 