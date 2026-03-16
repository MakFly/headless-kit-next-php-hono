import { createFileRoute } from '@tanstack/react-router'
import { SettingsIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export const Route = createFileRoute('/saas/settings')({
  component: SaasSettingsPage,
})

function SaasSettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">
          Configure your organization settings.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <SettingsIcon className="size-5" />
            Organization Settings
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Settings page will include organization name, slug, timezone, language, and notification preferences.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
