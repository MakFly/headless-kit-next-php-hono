'use client'

import * as React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  Shell,
  House,
  DollarSign,
  Images,
  Bookmark,
  Users,
  MessageSquareText,
} from 'lucide-react'

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

type AppSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User | null
}

const navItems = [
  { title: 'Dashboard', href: '/dashboard', icon: House, exact: true },
  { title: 'Orders', href: '/dashboard/orders', icon: DollarSign, exact: false },
  { title: 'Products', href: '/dashboard/products', icon: Images, exact: false },
  { title: 'Categories', href: '/dashboard/categories', icon: Bookmark, exact: false },
  { title: 'Customers', href: '/dashboard/customers', icon: Users, exact: false },
  { title: 'Reviews', href: '/dashboard/reviews', icon: MessageSquareText, exact: false },
]

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const location = useLocation()
  const pathname = location.pathname

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/dashboard">
                <Shell className="!size-5" />
                <span className="text-base font-semibold">Headless Kit</span>
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
                      <Link to={item.href}>
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
        <NavUser
          user={{
            name: user?.name ?? 'User',
            email: user?.email ?? '',
            avatar: user?.avatar_url ?? '',
          }}
        />
      </SidebarFooter>
    </Sidebar>
  )
}
