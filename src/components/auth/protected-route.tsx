'use client'

import { useSession, signOut } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface ProtectedRouteProps {
  children: React.ReactNode
}

export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [isFirstRender, setIsFirstRender] = useState(true)

  useEffect(() => {
    // Skip toast notification on initial render
    if (isFirstRender) {
      setIsFirstRender(false)
      return
    }

    // Handle session expiration or user not existing
    if (status === 'unauthenticated') {
      toast.error('La tua sessione è scaduta. Effettua nuovamente il login.', {
        id: 'session-expired',
        duration: 4000,
      })
      router.push('/auth/login')
    }

    if (status === 'authenticated') {
      // Handle case where session exists but is invalid (user might have been deleted)
      if (!session.user?.id) {
        toast.error('La tua sessione non è più valida. Effettua nuovamente il login.', {
          id: 'invalid-session',
          duration: 4000,
        })
        signOut({ redirect: true, callbackUrl: '/auth/login' })
        return
      }

      // Handle incomplete onboarding
      if (!session?.user?.hasCompletedOnboarding) {
        router.push('/onboarding')
      } else if (window.location.pathname === '/onboarding') {
        router.push('/dashboard')
      }
    }
  }, [status, session, router, isFirstRender])

  // Save the current URL for potential redirection after login
  useEffect(() => {
    if (status === 'unauthenticated' && typeof window !== 'undefined') {
      // Don't set callback URL for login-related pages
      if (!window.location.pathname.startsWith('/auth/')) {
        sessionStorage.setItem('callbackUrl', window.location.pathname)
      }
    }
  }, [status])

  if (status === 'loading') {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="sr-only">Caricamento</span>
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.id) {
    return <>{children}</>
  }

  // Non renderizzare nulla durante il reindirizzamento
  return null
} 