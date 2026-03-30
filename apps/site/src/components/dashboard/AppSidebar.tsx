import { cn } from "@/lib/utils"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  LayoutDashboard,
  Key,
  Download,
  CreditCard,
  BookOpen,
  ArrowLeft,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  MoreVertical,
  Terminal,
} from "lucide-react"
import { getMessages, type Locale } from "@/i18n"

type NavItem = {
  href: string
  label: string
  icon: React.ElementType
  external?: boolean
}

type AppSidebarProps = {
  user: { name: string; email: string; role?: string }
  currentPath: string
  locale: Locale
}

function buildAccountNav(t: ReturnType<typeof getMessages>): NavItem[] {
  return [
    { href: "/dashboard", label: t.dashboard.overview, icon: LayoutDashboard },
    { href: "/dashboard/license", label: t.dashboard.license, icon: Key },
    { href: "/dashboard/downloads", label: t.dashboard.downloads, icon: Download },
    { href: "/dashboard/billing", label: t.dashboard.billing, icon: CreditCard },
  ]
}

function buildAdminNav(t: ReturnType<typeof getMessages>): NavItem[] {
  return [
    { href: "/dashboard/admin/users", label: t.dashboard.users, icon: Users },
    { href: "/dashboard/admin/licenses", label: t.dashboard.licenses, icon: Key },
    { href: "/dashboard/admin/revenue", label: t.dashboard.revenue, icon: TrendingUp },
    { href: "/dashboard/admin/settings", label: t.dashboard.settings, icon: Settings },
  ]
}

function buildSecondaryNav(t: ReturnType<typeof getMessages>): NavItem[] {
  return [
    { href: "/docs", label: t.dashboard.documentation, icon: BookOpen, external: true },
    { href: "/", label: t.dashboard.backToSite, icon: ArrowLeft },
  ]
}

function checkActive(currentPath: string, href: string, isRoot: boolean): boolean {
  if (isRoot) return currentPath === href
  return currentPath === href || currentPath.startsWith(href + "/")
}

function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function AppSidebar({ user, currentPath, locale }: AppSidebarProps) {
  const t = getMessages(locale)
  const accountNav = buildAccountNav(t)
  const adminNav = buildAdminNav(t)
  const secondaryNav = buildSecondaryNav(t)
  const isUserAdmin = user.role === "admin"

  const handleSignOut = async () => {
    await fetch("/api/auth/sign-out", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({}),
      credentials: "include",
    })
    window.location.href = "/"
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <a href="/dashboard">
                <Terminal className="!size-5" />
                <span className="text-base font-semibold">Headless Kit</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        {/* Account section */}
        <SidebarGroup>
          <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">
            {t.dashboard.account}
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {accountNav.map((item) => {
                const active = checkActive(currentPath, item.href, item.href === "/dashboard")
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton
                      asChild
                      isActive={active}
                      tooltip={item.label}
                      className={cn(
                        active && "text-primary bg-primary/10 hover:bg-primary/15 hover:text-primary"
                      )}
                    >
                      <a href={item.href}>
                        <item.icon className="size-4" />
                        <span>{item.label}</span>
                      </a>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* Administration section (admin only) */}
        {isUserAdmin && (
          <>
            <SidebarSeparator />
            <SidebarGroup>
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest">
                {t.dashboard.administration}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {adminNav.map((item) => {
                    const active = checkActive(currentPath, item.href, false)
                    return (
                      <SidebarMenuItem key={item.href}>
                        <SidebarMenuButton
                          asChild
                          isActive={active}
                          tooltip={item.label}
                          className={cn(
                            active && "text-apple-purple bg-apple-purple/10 hover:bg-apple-purple/15 hover:text-apple-purple"
                          )}
                        >
                          <a href={item.href}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </a>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    )
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          </>
        )}

        <SidebarSeparator />

        {/* Secondary nav */}
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {secondaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton asChild tooltip={item.label}>
                    <a
                      href={item.href}
                      {...(item.external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
                    >
                      <item.icon className="size-4" />
                      <span>{item.label}</span>
                    </a>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton
                  size="lg"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                >
                  <Avatar className="h-8 w-8 rounded-lg">
                    <AvatarFallback className="rounded-lg text-xs bg-primary/10 text-primary">
                      {getInitials(user.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="grid flex-1 text-left text-sm leading-tight">
                    <span className="truncate font-medium">{user.name}</span>
                    <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                  </div>
                  <MoreVertical className="ml-auto size-4" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg"
                side="bottom"
                align="end"
                sideOffset={4}
              >
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
                    <Avatar className="h-8 w-8 rounded-lg">
                      <AvatarFallback className="rounded-lg text-xs bg-primary/10 text-primary">
                        {getInitials(user.name)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight">
                      <span className="truncate font-medium">{user.name}</span>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut} className="text-destructive cursor-pointer">
                  <LogOut className="size-4" />
                  {t.dashboard.signOut}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
