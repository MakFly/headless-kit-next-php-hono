import { createFileRoute } from '@tanstack/react-router'
import { AdminAnalyticsContent } from '@/components/shop/admin/analytics-content'

export const Route = createFileRoute('/shop/admin/analytics')({
  component: AnalyticsPage,
})

function AnalyticsPage() {
  return <AdminAnalyticsContent />
}
