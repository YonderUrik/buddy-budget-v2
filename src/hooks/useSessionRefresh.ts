'use client'

import { useSession } from 'next-auth/react'
import { useCallback, useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

// This hook provides session validity checking and auto-refresh functionality
export function useSessionRefresh(refreshIntervalMs = 5 * 60 * 1000) { // Default: check every 5 minutes
  const { data: session, status, update } = useSession()
  const router = useRouter()
  const [lastRefreshed, setLastRefreshed] = useState<Date>(new Date())
  const [refreshing, setRefreshing] = useState(false)

  // Function to refresh the session
  const refreshSession = useCallback(async () => {
    if (refreshing) return // Prevent multiple concurrent refreshes

    try {
      setRefreshing(true)
      await update() // This triggers the jwt and session callbacks in auth.ts
      setLastRefreshed(new Date())
    } catch (error) {
      console.error('Error refreshing session:', error)
      toast.error('Errore durante l\'aggiornamento della sessione', {
        id: 'session-refresh-error',
      })
    } finally {
      setRefreshing(false)
    }
  }, [refreshing, update])

  // Periodic refresh based on interval
  useEffect(() => {
    if (status !== 'authenticated') return

    const intervalId = setInterval(() => {
      refreshSession()
    }, refreshIntervalMs)

    return () => clearInterval(intervalId)
  }, [status, refreshIntervalMs, refreshSession])

  // Handle session expiration - check if the token was marked as invalid
  useEffect(() => {
    // Only run this effect when session exists but lacks user data
    if (status === 'authenticated' && session && !session.user?.id) {
      toast.error('La tua sessione non è più valida. Effettua nuovamente il login.', {
        id: 'invalid-session-hook',
      })

      // Save current path for redirect after login (except for auth pages)
      if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth/')) {
        sessionStorage.setItem('callbackUrl', window.location.pathname)
      }

      router.push('/auth/login')
    }
  }, [session, status, router])

  return {
    lastRefreshed,
    refreshing,
    refreshSession,
    isSessionValid: status === 'authenticated' && !!session?.user?.id
  }
} 