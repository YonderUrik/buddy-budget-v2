'use client'

import { Button, ButtonProps } from '@/components/ui/button'
import { signOut } from 'next-auth/react'
import { LogOut } from 'lucide-react'

interface LogoutButtonProps extends ButtonProps {
  showIcon?: boolean
}

export function LogoutButton({ 
  children = 'Logout', 
  showIcon = true, 
  ...props 
}: LogoutButtonProps) {
  const handleLogout = async () => {
    await signOut({ callbackUrl: '/auth/login' })
  }

  return (
    <Button onClick={handleLogout} {...props}>
      {showIcon && <LogOut className="mr-2 h-4 w-4" />}
      {children}
    </Button>
  )
} 