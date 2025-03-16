import { ProtectedRoute } from '@/components/auth/protected-route'
import { DashboardNav } from '@/components/dashboard/nav'

export default function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ProtectedRoute>
      {children}
    </ProtectedRoute>
  )
} 