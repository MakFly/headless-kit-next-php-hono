"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Bot,
  Headphones,
  House,
  Inbox,
  FileText,
  Star,
} from "lucide-react"

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
} from "@/components/ui/sidebar"
import { useAuthStore } from "@/stores/auth-store"
import type { User } from "@/types"

type SupportSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialUser?: User | null
}

const navItems = [
  { title: "New AI Chat", href: "/support/c", icon: Bot, exact: false },
  { title: "Dashboard", href: "/support", icon: House, exact: true },
  { title: "Agent Queue", href: "/support/agent", icon: Inbox, exact: true },
  { title: "Canned Responses", href: "/support/agent/canned", icon: FileText, exact: false },
  { title: "Ratings", href: "/support/agent/ratings", icon: Star, exact: false },
]

export function SupportSidebar({ initialUser, ...props }: SupportSidebarProps) {
  const pathname = usePathname()
  const { user: storeUser, isHydrated, logout } = useAuthStore()

  const user = isHydrated ? storeUser : initialUser

  const userData = user
    ? { name: user.name, email: user.email, avatar: user.avatar_url }
    : null

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/support">
                <Headphones className="!size-5" />
                <span className="text-base font-semibold">Support Center</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {navItems.map((item) => {
                const isActive = item.exact
                  ? pathname === item.href
                  : pathname.startsWith(item.href)
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <item.icon />
                        {item.title}
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {userData && <NavUser user={userData} logout={logout} logoutRedirect="/support/auth/login" />}
      </SidebarFooter>
    </Sidebar>
  )
}
