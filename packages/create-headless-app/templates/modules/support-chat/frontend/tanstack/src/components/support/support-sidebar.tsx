import { House, MessageSquare, Inbox, FileText, Star, Headphones } from 'lucide-react'
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

type SupportSidebarProps = React.ComponentProps<typeof Sidebar> & {
  user: User | null
}

const navItems = [
  { title: 'Dashboard', url: '/support', icon: House, exact: true },
  { title: 'Conversations', url: '/support/conversations', icon: MessageSquare, exact: false },
  { title: 'Agent Queue', url: '/support/agent', icon: Inbox, exact: false },
  { title: 'Canned Responses', url: '/support/agent/canned', icon: FileText, exact: false },
  { title: 'Ratings', url: '/support/agent/ratings', icon: Star, exact: false },
]

export function SupportSidebar({ user, ...props }: SupportSidebarProps) {
  const { pathname } = useLocation()

  return (
    <Sidebar variant="floating" collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild className="data-[slot=sidebar-menu-button]:!p-1.5">
              <Link to="/support">
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
