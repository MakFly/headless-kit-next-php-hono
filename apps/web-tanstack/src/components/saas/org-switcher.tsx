import { useNavigate } from '@tanstack/react-router'
import { Building2, Check, ChevronsUpDown, Plus } from 'lucide-react'
import { useOrgStore } from '@/stores/org-store'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function OrgSwitcher() {
  const navigate = useNavigate()
  const { orgs, activeOrg, setActiveOrg } = useOrgStore()

  if (!activeOrg) return null

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="w-full justify-between gap-2 px-2">
          <div className="flex items-center gap-2 truncate">
            <Building2 className="size-4 shrink-0" />
            <span className="truncate text-sm font-medium">{activeOrg.name}</span>
          </div>
          <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-[240px]">
        <DropdownMenuLabel>Organizations</DropdownMenuLabel>
        {orgs.map((org) => (
          <DropdownMenuItem
            key={org.id}
            onClick={() => setActiveOrg(org)}
            className="flex items-center justify-between"
          >
            <div className="flex items-center gap-2 truncate">
              <Building2 className="size-4 shrink-0" />
              <span className="truncate">{org.name}</span>
              <Badge variant="outline" className="ml-1 text-[10px]">{org.role}</Badge>
            </div>
            {activeOrg.id === org.id && <Check className="size-4 shrink-0" />}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate({ to: '/saas/onboarding' })}>
          <Plus className="size-4 mr-2" />
          New Organization
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
