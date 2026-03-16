"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Shell,
  House,
  DollarSign,
  Images,
  Bookmark,
  Users,
  MessageSquareText,
  BarChart3,
  Package,
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

type AdminSidebarProps = React.ComponentProps<typeof Sidebar> & {
  initialUser: User
}

const navItems = [
  { title: "Dashboard",   url: "/shop/admin",            icon: House              },
  { title: "Orders",      url: "/shop/admin/orders",     icon: DollarSign         },
  { title: "Products",    url: "/shop/admin/products",   icon: Images             },
  { title: "Categories",  url: "/shop/admin/categories", icon: Bookmark           },
  { title: "Customers",   url: "/shop/admin/customers",  icon: Users              },
  { title: "Reviews",     url: "/shop/admin/reviews",    icon: MessageSquareText  },
  { title: "Analytics",   url: "/shop/admin/analytics",  icon: BarChart3          },
  { title: "Inventory",   url: "/shop/admin/inventory",  icon: Package            },
]

export function AdminSidebar({ initialUser, ...props }: AdminSidebarProps) {
  const pathname = usePathname()
  const { user: storeUser, isHydrated, logout } = useAuthStore()
  const user = isHydrated ? storeUser : initialUser

  const userData = user
    ? { name: user.name, email: user.email, avatar: user.avatar_url }
    : { name: initialUser.name, email: initialUser.email, avatar: initialUser.avatar_url }

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link href="/shop/admin">
                <Shell className="!size-5" />
                <span className="text-base font-semibold">Shop Admin</span>
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
                const isActive =
                  item.url === "/shop/admin"
                    ? pathname === "/shop/admin"
                    : pathname.startsWith(item.url)
                return (
                  <SidebarMenuItem key={item.url}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.title}>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
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
        <NavUser user={userData} logout={logout} logoutRedirect="/shop/auth/login" />
      </SidebarFooter>
    </Sidebar>
  )
}
