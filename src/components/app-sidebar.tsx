"use client"

import * as React from "react"
import {
  AlignHorizontalDistributeCenter,
  ArrowLeftRight,
  Banknote,
  Bitcoin,
  BriefcaseBusiness,
  ChartCandlestick,
  ChartPie,
  LayoutDashboard,
  MapPin,
  PiggyBank,
  Wallet,
} from "lucide-react"
import Image from 'next/image'

import { NavMain } from "@/components/nav-main"
import { NavUser } from "@/components/nav-user"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react"
import { APP_NAME } from "@/lib/config"
import { isCurrentUrl } from "@/lib/utils"
import { useLiquidityAccounts } from "@/providers/liquidity-accounts-provider";


export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const { data: session } = useSession();
  const { accounts = [] } = useLiquidityAccounts();

  // This is sample data.
  const data = {
    nav: [
      { title: 'Dashboard', path: '/dashboard', icon: LayoutDashboard, },
      { title: 'Conti', path: '/dashboard/accounts', icon: Wallet },
      { title: 'Transazioni', path: '/dashboard/transactions', icon: ArrowLeftRight },
      { title: 'Budget', path: '/dashboard/budget', icon: PiggyBank },
      { title: 'Investimenti', path: '/dashboard/investments', icon: ChartCandlestick },
      { title: 'Report', path: '/dashboard/investments', icon: ChartPie }
    ],
    investmentsNav:
    {
      name: 'Portafoglio',
      amount: 10000,
      variation: 0.222,
      items: [
        {
          title: "Liquidità",
          icon: Banknote,
          isActive: false,
          amount: accounts.reduce((total, account) => total + account.balance, 0),
          items: accounts.map((account) => ({
            title: account.name,
            amount: account.balance,
            variation: 0
          }))
        },
        {
          title: "Stocks",
          icon: AlignHorizontalDistributeCenter,
          isActive: false,
          amount: 1000000,
          items: [
            {
              title: "History",
              amount: 100000,
              variation: -0.222,
            },
          ],
        },
        {
          title: "Crypto",
          icon: Bitcoin,
          isActive: false,
          amount: 100000,
          items: [
            {
              title: "History",
              amount: 100000,
              variation: 0,
            },
          ],
        },
        {
          title: "Immobiliare",
          icon: MapPin,
          isActive: false,
          amount: 1000,
          items: [
            {
              title: "History",
              amount: 100000,
              variation: 0,
            },
          ],
        },
        {
          title: "Pensione",
          icon: BriefcaseBusiness,
          isActive: false,
          amount: 1000,
          items: [
            {
              title: "History",
              amount: 0,
              variation: 0,
            },
          ],
        },
      ]
    },
  }

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="flex items-center gap-2">
            <div className="text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg border border-sidebar-accent p-1 shadow-md transition-transform transform hover:scale-105">
              <Image
                src="/main-logo.png"
                alt="App Logo"
                width={24}
                height={24}
                className="rounded-full"
                priority
              />
            </div>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-medium">{APP_NAME}</span>
            </div>
          </div>
        </SidebarMenuButton>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-2">
            <SidebarMenu>
              {data.nav.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton tooltip={item.title} asChild isActive={isCurrentUrl(item.path, true)}>
                    <a href={item.path}>
                      {item.icon && <item.icon />}
                      <span>{item.title}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <NavMain elements={data.investmentsNav} />
      </SidebarContent>
      <SidebarFooter>
        <NavUser user={{ name: session?.user?.name || '', email: session?.user?.email || '', avatar: '' }} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  )
}
