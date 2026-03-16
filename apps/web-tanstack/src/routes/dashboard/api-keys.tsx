import { createFileRoute } from '@tanstack/react-router'
import { ApiKeysTable } from '@/components/dashboard/api-keys-table'

export const Route = createFileRoute('/dashboard/api-keys')({
  component: ApiKeysPage,
})

function ApiKeysPage() {
  const context = Route.useRouteContext()
  return <ApiKeysTable userId={context.user?.id ?? 0} />
}
