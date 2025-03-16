"use client";

import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export default function DashboardPage() {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <div className="container mx-auto py-8">
      <header className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Buddy Budget</h1>
        <Button onClick={() => signOut({ callbackUrl: "/auth/login" })}>
          Logout
        </Button>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Benvenuto, {session?.user?.name}</CardTitle>
            <CardDescription>Panoramica del tuo portfolio</CardDescription>
          </CardHeader>
          <CardContent>
            <p>Il tuo patrimonio netto è attualmente in fase di calcolo.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/accounts")}>
              Gestisci i tuoi conti
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Transazioni recenti</CardTitle>
            <CardDescription>Le tue ultime attività finanziarie</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Non ci sono transazioni recenti da visualizzare.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/transactions")}>
              Aggiungi transazione
            </Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Budget mensile</CardTitle>
            <CardDescription>Monitoraggio delle spese</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">Non hai ancora creato un budget.</p>
          </CardContent>
          <CardFooter>
            <Button variant="outline" className="w-full" onClick={() => router.push("/budget")}>
              Crea budget
            </Button>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
} 