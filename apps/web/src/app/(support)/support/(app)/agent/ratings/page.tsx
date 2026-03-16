import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { getRatingsAction } from '@/lib/actions/support/canned';
import { StarIcon } from 'lucide-react';

export default async function RatingsPage() {
  let ratings;
  let error: string | null = null;

  try {
    ratings = await getRatingsAction();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load ratings';
  }

  return (
    <>
      <SiteHeader title="Customer Ratings" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error ? (
          <Card>
            <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
          </Card>
        ) : ratings ? (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Average Rating</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col items-center gap-3">
                <span className="text-5xl font-bold">{ratings.average.toFixed(1)}</span>
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <StarIcon
                      key={star}
                      className={`h-6 w-6 ${
                        star <= Math.round(ratings.average)
                          ? 'fill-yellow-400 text-yellow-400'
                          : 'text-muted-foreground'
                      }`}
                    />
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Based on {ratings.total} rating{ratings.total !== 1 ? 's' : ''}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribution</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[5, 4, 3, 2, 1].map((star) => {
                  const count = ratings.distribution[star] ?? 0;
                  const percentage = ratings.total > 0 ? Math.round((count / ratings.total) * 100) : 0;
                  return (
                    <div key={star} className="flex items-center gap-3">
                      <div className="flex items-center gap-1 w-16 justify-end">
                        <span className="text-sm font-medium">{star}</span>
                        <StarIcon className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                      </div>
                      <Progress value={percentage} className="flex-1" />
                      <span className="text-sm text-muted-foreground w-12 text-right">
                        {count}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>
    </>
  );
}
