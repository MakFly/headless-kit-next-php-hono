import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import type { Order } from '@/types/shop'
import { getAdminOrdersFn } from '@/lib/services/admin-service'
import { formatDate, formatPrice } from '@/components/shop/admin/format'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function PendingOrders() {
  const [orders, setOrders] = useState<Array<Order>>([])
  const [loading, setLoading] = useState(true)

  const fetchOrders = useCallback(async () => {
    try {
      const result = await getAdminOrdersFn({
        data: {
          filters: {
            status: 'pending',
            perPage: 5,
          },
        },
      })
      setOrders(result.data)
    } catch {
      setOrders([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  return (
    <Card className="flex-1">
      <CardContent>
        <h2 className="text-xl font-semibold mb-4">Pending Orders</h2>
        {loading ? (
          <div className="space-y-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="flex items-center gap-3">
                <Skeleton className="h-10 w-10 rounded-full" />
                <div className="flex-1 space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
                <Skeleton className="h-4 w-16" />
              </div>
            ))}
          </div>
        ) : orders.length > 0 ? (
          <div>
            <div className="divide-y">
              {orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center gap-3 py-2"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-muted text-xs">
                      {getInitials(order.userId)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-muted-foreground">
                      {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm font-medium truncate">
                      {order.userId}
                    </p>
                  </div>
                  <span className="text-sm font-semibold tabular-nums">
                    {formatPrice(order.total)}
                  </span>
                </div>
              ))}
            </div>
            <div className="pt-4">
              <Link
                to="/shop/admin/orders"
                className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' w-full'}
              >
                All orders
              </Link>
            </div>
          </div>
        ) : (
          <p className="text-center text-sm text-muted-foreground">
            No pending orders.
          </p>
        )}
      </CardContent>
    </Card>
  )
}
