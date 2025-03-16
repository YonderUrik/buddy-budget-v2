'use client'

import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import { Loader2 } from 'lucide-react'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/login')
    }

    if (status === 'authenticated') {
      if (!session?.user.hasCompletedOnboarding) {
        router.push('/onboarding');
      } else if (window.location.pathname === '/onboarding') {
        router.push('/dashboard');
      }
    }
  }, [status, session, router])

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Caricamento</span>
      </div>
    )
  }

  if (status === 'authenticated') {
    return <>{children}</>
  }

  // Non renderizzare nulla durante il reindirizzamento
  return null
} 