import { NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'
import type { NextRequest } from 'next/server'

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
    '/terms',
    '/privacy',
    '/policy'
  ];
  
  // Verifica se il percorso è pubblico
  const isPublicPath = publicPaths.some(path => 
    pathname.startsWith(path) || pathname === path
  );
  
  // Gestione delle API
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }
  
  // Check if token exists but is invalid (user deleted or doesn't exist anymore)
  if (isAuthenticated && token.isValid === false) {
    // Save the current URL for redirection after login
    const redirectUrl = new URL("/auth/login", request.url);
    if (!isPublicPath) {
      redirectUrl.searchParams.set("callbackUrl", encodeURI(pathname));
    }
    
    // Clear the auth cookies
    const response = NextResponse.redirect(redirectUrl);
    response.cookies.delete("next-auth.session-token");
    response.cookies.delete("next-auth.csrf-token");
    response.cookies.delete("next-auth.callback-url");
    
    return response;
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
    const hasCompletedOnboarding = token.hasCompletedOnboarding;
    
    // Se l'utente non ha completato l'onboarding, reindirizzalo alla pagina di onboarding
    if (hasCompletedOnboarding === false) {
      return NextResponse.redirect(new URL("/onboarding", request.url));
    }
  }
  
  // Se l'utente ha completato l'onboarding e tenta di accedere alla pagina di onboarding, reindirizzalo alla dashboard
  if (isAuthenticated && pathname === "/onboarding") {
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