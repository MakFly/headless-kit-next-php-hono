'use client'

import { House, CreditCard, Users, BarChart3, Settings, Rocket } from 'lucide-react'
import { Link, useLocation } from '@tanstack/react-router'

import { NavUser } from '@/components/nav-user'
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
} from '@/components/ui/sidebar'
import type { User } from '@/types'

type SaasSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User | null
}

const navItems = [
  { title: 'Dashboard', url: '/saas', icon: House, exact: true },
  { title: 'Billing', url: '/saas/billing', icon: CreditCard, exact: false },
  { title: 'Team', url: '/saas/team', icon: Users, exact: false },
  { title: 'Usage', url: '/saas/usage', icon: BarChart3, exact: false },
  { title: 'Settings', url: '/saas/settings', icon: Settings, exact: false },
]

export function SaasSidebar({ user, ...props }: SaasSidebarProps) {
  const { pathname } = useLocation()

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/saas">
                <Rocket className="!size-5" />
                <span className="text-base font-semibold">SaaS Platform</span>
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
                  ? pathname === item.url
                  : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.url}>
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
        {user && (
          <NavUser
            user={{
              name: user.name ?? 'User',
              email: user.email ?? '',
              avatar: user.avatar_url ?? '',
            }}
          />
        )}
      </SidebarFooter>
    </Sidebar>
  )
}
