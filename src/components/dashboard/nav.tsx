'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/auth/logout-button'
import { 
  LayoutDashboard, 
  Receipt, 
  PieChart, 
  CreditCard, 
  Settings, 
  HelpCircle 
} from 'lucide-react'
import { APP_NAME } from '@/lib/config'

const navItems = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: LayoutDashboard
  },
  {
    title: 'Transazioni',
    href: '/transactions',
    icon: Receipt
  },
  {
    title: 'Budget',
    href: '/budget',
    icon: PieChart
  },
  {
    title: 'Conti',
    href: '/accounts',
    icon: CreditCard
  },
  {
    title: 'Impostazioni',
    href: '/settings',
    icon: Settings
  }
]

export function DashboardNav() {
  const pathname = usePathname()

  return (
    <div className="flex flex-col h-screen border-r bg-background">
      <div className="p-4 border-b">
        <Link href="/dashboard" className="flex items-center gap-2">
          <span className="font-bold text-xl">{APP_NAME}</span>
        </Link>
      </div>
      
      <div className="flex-1 overflow-auto py-2">
        <nav className="grid gap-1 px-2">
          {navItems.map((item) => (
            <Button
              key={item.href}
              variant={pathname === item.href ? 'secondary' : 'ghost'}
              className={cn(
                'justify-start',
                pathname === item.href && 'bg-secondary'
              )}
              asChild
            >
              <Link href={item.href}>
                <item.icon className="mr-2 h-4 w-4" />
                {item.title}
              </Link>
            </Button>
          ))}
        </nav>
      </div>
      
      <div className="p-4 border-t mt-auto">
        <div className="grid gap-2">
          <Button variant="ghost" asChild className="justify-start">
            <Link href="/support">
              <HelpCircle className="mr-2 h-4 w-4" />
              Supporto
            </Link>
          </Button>
          <LogoutButton variant="outline" className="w-full justify-start" />
        </div>
      </div>
    </div>
  )
} 