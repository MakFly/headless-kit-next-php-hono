import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { StarIcon } from 'lucide-react'

export const Route = createFileRoute('/support/agent/ratings')({
  component: RatingsPage,
})

function RatingsPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Ratings</h2>
        <p className="text-muted-foreground">
          Customer satisfaction ratings overview.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StarIcon className="size-5" />
            CSAT Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Shows average CSAT score, distribution chart, and individual rating details.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
