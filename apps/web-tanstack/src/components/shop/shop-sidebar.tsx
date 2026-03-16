'use client'

import * as React from 'react'
import { Link, useLocation } from '@tanstack/react-router'
import {
  ShoppingBag,
  Package,
  Tag,
  ShoppingCart,
  ClipboardList,
  CreditCard,
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

type ShopSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User | null
}

const navItems = [
  { title: 'Browse', url: '/shop', icon: Package, exact: true },
  { title: 'Categories', url: '/shop/categories/all', icon: Tag, exact: false },
  { title: 'Cart', url: '/shop/cart', icon: ShoppingCart, exact: false },
  { title: 'Orders', url: '/shop/orders', icon: ClipboardList, exact: false },
  { title: 'Checkout', url: '/shop/checkout', icon: CreditCard, exact: false },
]

export function ShopSidebar({ user, ...props }: ShopSidebarProps) {
  const { pathname } = useLocation()

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/shop">
                <ShoppingBag className="!size-5" />
                <span className="text-base font-semibold">Shop</span>
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
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
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
