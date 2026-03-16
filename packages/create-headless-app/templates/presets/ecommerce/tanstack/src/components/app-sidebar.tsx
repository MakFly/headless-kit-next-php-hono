'use client'

import { ShieldIcon } from 'lucide-react'
import {
  LayoutDashboardIcon,
  UsersIcon,
  ShieldCheckIcon,
  SettingsIcon,
  PackageIcon,
  ShoppingCartIcon,
} from 'lucide-react'

import { NavMain } from '@/components/nav-main'
import { NavUser } from '@/components/nav-user'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar'
import type { User } from '@/types'

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user: User | null
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const isAdmin = user?.roles?.some((r) => r.slug === 'admin') ?? false

  const navItems = [
    {
      title: 'Dashboard',
      url: '/dashboard',
      icon: LayoutDashboardIcon,
    },
    {
      title: 'Products',
      url: '/dashboard/products',
      icon: PackageIcon,
    },
    {
      title: 'Orders',
      url: '/dashboard/orders',
      icon: ShoppingCartIcon,
    },
    ...(isAdmin
      ? [
          {
            title: 'Users',
            url: '/dashboard/users',
            icon: UsersIcon,
          },
          {
            title: 'Roles',
            url: '/dashboard/roles',
            icon: ShieldCheckIcon,
          },
        ]
      : []),
    {
      title: 'Settings',
      url: '/dashboard/settings',
      icon: SettingsIcon,
    },
  ]

  return (
    <Sidebar collapsible="offcanvas" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="/dashboard">
                <ShieldIcon className="size-5! text-[var(--neon)]" />
                <span className="font-mono text-base font-semibold">
                  Admin Panel
                </span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <NavMain items={navItems} />
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
