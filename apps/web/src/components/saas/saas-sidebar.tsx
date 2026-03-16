"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  House,
  CreditCard,
  Users,
  BarChart3,
  Settings,
} from "lucide-react"

import { NavUser } from "@/components/nav-user"
import { OrgSwitcher } from "@/components/saas/org-switcher"
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

type SaasSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialUser?: User | null
}

const navItems = [
  { title: "Dashboard", href: "/saas", icon: House, exact: true },
  { title: "Billing", href: "/saas/billing", icon: CreditCard, exact: false },
  { title: "Team", href: "/saas/team", icon: Users, exact: false },
  { title: "Usage", href: "/saas/usage", icon: BarChart3, exact: false },
  { title: "Settings", href: "/saas/settings", icon: Settings, exact: false },
]

export function SaasSidebar({ initialUser, ...props }: SaasSidebarProps) {
  const pathname = usePathname()
  const { user: storeUser, isHydrated, logout } = useAuthStore()

  const user = isHydrated ? storeUser : initialUser

  const userData = user
    ? { name: user.name, email: user.email, avatar: user.avatar_url }
    : null

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <OrgSwitcher />
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
        {userData && <NavUser user={userData} logout={logout} logoutRedirect="/saas/auth/login" />}
      </SidebarFooter>
    </Sidebar>
  )
}
