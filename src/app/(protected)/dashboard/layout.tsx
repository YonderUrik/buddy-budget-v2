'use client'

import { AppSidebar } from "@/components/app-sidebar"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar"
import { LiquidityAccountProvider } from "@/providers/liquidity-accounts-provider";
import { useSessionRefresh } from "@/hooks/useSessionRefresh";


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  // Initialize the session refresh hook to automatically check session validity periodically
  useSessionRefresh();
  
  return (
    <LiquidityAccountProvider>
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
            <div className="flex items-center gap-2 px-4">
              <SidebarTrigger className="-ml-1" />
            </div>
          </header>
          <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
            {children}
          </div>
        </SidebarInset>
      </SidebarProvider>
    </LiquidityAccountProvider>
  )
}
