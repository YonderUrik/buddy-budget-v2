"use client"

import { ChevronRight, type LucideIcon } from "lucide-react"

import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import { useSession } from "next-auth/react";
import { createFormatters } from "@/lib/utils";

interface NavMainProps {
  elements: {
    name: string;
    amount: number,
    variation: number,
    items: {
      title: string;
      amount: number;
      isActive: boolean;
      icon?: LucideIcon;
      items: { title: string; amount: number, variation: number }[];
    }[];
  };
}

export function NavMain({ elements }: NavMainProps) {
  const { data: session } = useSession()

  const userCurrency = session?.user?.primaryCurrency || 'EUR'

  const { formatCurrency, formatPercentage } = createFormatters()
  return (
    <SidebarGroup>
      <SidebarGroupLabel className="flex justify-between items-center">
        <span >{elements.name}</span>
        <div className="flex items-center gap-2">
          <span>{formatCurrency(elements.amount, userCurrency)}</span>
          {elements.variation !== 0 &&
            <span className={`text-xs px-1.5 py-0.5  ${elements.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {elements.variation >= 0 ? '+' : ''} {(formatPercentage(elements.variation))}
            </span>}
        </div>
      </SidebarGroupLabel>
      <SidebarMenu className="space-y-1">
        {elements.items.map((item) => (
          <Collapsible
            key={item.title}
            asChild
            defaultOpen={item.isActive}
            className="group/collapsible"
          >
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton
                  tooltip={item.title}
                  className="hover:bg-sidebar-hover transition-colors duration-200"
                >
                  {item.icon && <item.icon className="text-sidebar-foreground/70" />}
                  <span >{item.title}</span>
                  {item.amount > 0 && (
                    <div className="flex ml-auto items-center text-xs">
                      <span>{formatCurrency(item.amount, userCurrency, undefined, true)}</span>
                    </div>
                  )}
                  <ChevronRight className="ml-auto h-4 w-4 text-sidebar-foreground/50 transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                </SidebarMenuButton>
              </CollapsibleTrigger>
              <CollapsibleContent className="animate-collapsible-down">
                <SidebarMenuSub className="pl-2 mt-1 space-y-1 border-l border-sidebar-muted">
                  {item.items.map((subItem) => (
                    <SidebarMenuSubItem key={subItem.title}>
                      <SidebarMenuSubButton
                        asChild
                        className="hover:bg-sidebar-hover/50 transition-colors duration-200"
                      >
                        <div className="flex justify-between  w-full ">
                          <span className="text-sm text-sidebar-foreground/80">{subItem.title}</span>
                          <div className="flex items-center gap-2">
                            {subItem.amount > 0 && <span className="text-xs text-sidebar-foreground/80">{formatCurrency(subItem.amount, userCurrency)}</span>}
                            {subItem.variation !== 0 &&
                              <span className={`text-xs px-1 py-0.5 rounded ${subItem.variation >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                {subItem.variation >= 0 ? '+' : ''} {(formatPercentage(subItem.variation))}
                              </span>}
                          </div>
                        </div>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
