import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { getAdminReviewsFn } from '@/lib/services/admin-service'
import type { Review } from '@/types/shop'
import { CardWithIcon } from '@/components/shop/admin/card-with-icon'
import { StarRating } from '@/components/shop/admin/star-rating'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { MessageCircle } from 'lucide-react'

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? '?'
  const l = lastName?.[0] ?? '?'
  return `${f}${l}`.toUpperCase()
}

export function PendingReviews() {
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)

  const fetchReviews = useCallback(async () => {
    try {
      const result = await getAdminReviewsFn({
        data: {
          filters: {
            status: 'pending',
            perPage: 5,
          },
        },
      })
      setReviews(result.data)
    } catch {
      setReviews([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchReviews()
  }, [fetchReviews])

  return (
    <CardWithIcon
      icon={MessageCircle}
      title="Pending Reviews"
      subtitle={loading ? '...' : reviews.length}
    >
      {loading ? (
        <div className="px-4 pb-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : reviews.length > 0 ? (
        <div>
          <div className="divide-y">
            {reviews.map((review) => {
              const name = review.customer
                ? `${review.customer.firstName} ${review.customer.lastName}`
                : `Customer`
              const initials = review.customer
                ? getInitials(review.customer.firstName, review.customer.lastName)
                : '??'

              return (
                <Link
                  key={review.id}
                  to="/shop/admin/reviews"
                  className="flex-1 flex flex-row items-start gap-3 px-4 py-2 no-underline text-inherit hover:bg-muted/50"
                >
                  <Avatar className="w-12 mt-2">
                    <AvatarFallback className="bg-muted text-xs">
                      {initials}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <p className="text-sm font-medium truncate">{name}</p>
                      <StarRating rating={review.rating} size={14} />
                    </div>
                    {review.comment && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                        {review.comment}
                      </p>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
          <div className="flex-grow">&nbsp;</div>
          <div className="p-4 pt-2">
            <Link
              to="/shop/admin/reviews"
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' w-full'}
            >
              All reviews
            </Link>
          </div>
        </div>
      ) : (
        <p className="px-4 pb-4 text-center text-sm text-muted-foreground">
          No pending reviews.
        </p>
      )}
    </CardWithIcon>
  )
}
