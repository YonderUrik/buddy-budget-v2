import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

// Configurazione delle route
const publicRoutes = [
  '/',
  '/auth/login',
  '/auth/register',
  '/auth/password-reset',
  '/terms',
  '/privacy',
  '/support',
  '/api/auth/register',
  '/api/auth/password-reset/request',
  '/api/auth/password-reset/verify',
  '/api/auth/password-reset/reset',
  '/api/contact'
]

// Route di NextAuth che devono essere sempre accessibili
const nextAuthRoutes = [
  '/api/auth/signin',
  '/api/auth/signout',
  '/api/auth/session',
  '/api/auth/providers',
  '/api/auth/csrf',
  '/api/auth/callback',
  '/api/auth/credentials'
]

const authRoutes = [
  '/auth/login',
  '/auth/register',
  '/auth/password-reset'
]

// Controlla se una route è pubblica
const isPublicRoute = (path: string) => {
  return publicRoutes.some(route => path === route || path.startsWith(`${route}/`))
}

// Controlla se una route è di NextAuth
const isNextAuthRoute = (path: string) => {
  return nextAuthRoutes.some(route => path === route || path.startsWith(`${route}/`))
}

// Controlla se una route è di autenticazione
const isAuthRoute = (path: string) => {
  return authRoutes.some(route => path === route || path.startsWith(`${route}/`))
}

// Controlla se una route è un'API
const isApiRoute = (path: string) => {
  return path.startsWith('/api/')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // Verifica se l'utente è autenticato
  const token = await getToken({ req: request });
  const isAuthenticated = !!token;
  
  // Percorsi pubblici che non richiedono autenticazione
  const publicPaths = [
    "/auth/login",
    "/auth/register",
    "/auth/password-reset",
    "/api/auth",
  ];
  
  // Verifica se il percorso è pubblico
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );
  
  // Gestione delle API
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  
  // Reindirizza gli utenti non autenticati alla pagina di login
  if (!isAuthenticated && !isPublicPath) {
    const url = new URL("/auth/login", request.url);
    url.searchParams.set("callbackUrl", encodeURI(pathname));
    return NextResponse.redirect(url);
  }
  
  // Reindirizza gli utenti autenticati dalla pagina di login alla dashboard
  if (isAuthenticated && isPublicPath) {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }
  
  // Gestione dell'onboarding
  if (isAuthenticated && !pathname.startsWith("/onboarding")) {
    // @ts-ignore - Il token può avere proprietà personalizzate
    const hasCompletedOnboarding = token.hasCompletedOnboarding;
    
    // Se l'utente non ha completato l'onboarding, reindirizzalo alla pagina di onboarding
    if (hasCompletedOnboarding === false) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }
  
  // Se l'utente ha completato l'onboarding e tenta di accedere alla pagina di onboarding, reindirizzalo alla dashboard
  if (isAuthenticated && pathname === "/onboarding") {
    // @ts-ignore - Il token può avere proprietà personalizzate
    const hasCompletedOnboarding = token.hasCompletedOnboarding;
    
    if (hasCompletedOnboarding === true) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }
  
  return NextResponse.next();
}

// Configura su quali percorsi il middleware dovrebbe essere eseguito
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public).*)",
  ],
}