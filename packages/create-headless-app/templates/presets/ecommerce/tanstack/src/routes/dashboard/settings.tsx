import { createFileRoute } from '@tanstack/react-router'
import { SettingsForm } from '@/components/dashboard/settings-form'
import { SettingsSkeleton } from '@/components/ui/skeletons'

export const Route = createFileRoute('/dashboard/settings')({
  component: SettingsPage,
  pendingComponent: SettingsSkeleton,
})

function SettingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>
      <SettingsForm />
    </div>
  )
}
