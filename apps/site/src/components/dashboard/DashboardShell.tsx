import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"
import { TooltipProvider } from "@/components/ui/tooltip"
import { AppSidebar } from "./AppSidebar"
import { SiteHeader } from "./SiteHeader"
import type { Locale } from "@/i18n"

type DashboardShellProps = {
  user: { name: string; email: string; role?: string }
  currentPath: string
  title: string
  locale: Locale
  children: React.ReactNode
}

export function DashboardShell({
  user,
  currentPath,
  title,
  locale,
  children,
}: DashboardShellProps) {
  return (
    <TooltipProvider>
      <SidebarProvider
        style={
          {
            "--sidebar-width": "calc(var(--spacing) * 72)",
            "--header-height": "calc(var(--spacing) * 12)",
          } as React.CSSProperties
        }
      >
        <AppSidebar user={user} currentPath={currentPath} locale={locale} />
        <SidebarInset id="main-content">
          <SiteHeader title={title} />
          <div className="flex flex-1 flex-col">
            <div className="@container/main flex flex-1 flex-col gap-2">
              <div className="flex flex-col gap-4 px-4 py-4 md:gap-6 md:px-6 md:py-6">
                {children}
              </div>
            </div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  )
}
