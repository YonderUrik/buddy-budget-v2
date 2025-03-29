import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../styles/globals.css";
import AuthProvider from "@/providers/auth-provider";
import { ThemeProvider } from "@/providers/theme-provider";
import { APP_NAME } from "@/lib/config";
import { Toaster } from "sonner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: APP_NAME,
  description: "Tieni traccia delle tue finanze e costruisci ricchezza",
  icons: {
    icon: "/favicon.ico", // Insert favicon here
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <AuthProvider>
          <Toaster position="top-right"/>
          <ThemeProvider>
            {children}
          </ThemeProvider>
        </AuthProvider>
      </body>
    </html>
  );
} 