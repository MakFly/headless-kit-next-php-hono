import { createFileRoute } from '@tanstack/react-router'
import { AdminReviewsTable } from '@/components/shop/admin/reviews-table'

export const Route = createFileRoute('/shop/admin/reviews')({
  component: ReviewsPage,
})

function ReviewsPage() {
  return <AdminReviewsTable />
}
