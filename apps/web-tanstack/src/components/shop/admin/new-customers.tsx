import { useCallback, useEffect, useState } from 'react'
import { Link } from '@tanstack/react-router'
import { Users } from 'lucide-react'
import type { Customer } from '@/types/shop'
import { getAdminCustomersFn } from '@/lib/services/admin-service'
import { formatDate } from '@/components/shop/admin/format'
import { CardWithIcon } from '@/components/shop/admin/card-with-icon'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'

function getInitials(firstName?: string, lastName?: string) {
  const f = firstName?.[0] ?? '?'
  const l = lastName?.[0] ?? '?'
  return `${f}${l}`.toUpperCase()
}

export function NewCustomers() {
  const [customers, setCustomers] = useState<Array<Customer>>([])
  const [loading, setLoading] = useState(true)

  const fetchCustomers = useCallback(async () => {
    try {
      const result = await getAdminCustomersFn({ data: { filters: { perPage: 10 } } })
      setCustomers(result.data)
    } catch {
      setCustomers([])
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchCustomers()
  }, [fetchCustomers])

  return (
    <CardWithIcon
      icon={Users}
      title="New Customers"
      subtitle={loading ? '...' : customers.length}
    >
      {loading ? (
        <div className="px-4 pb-4 space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3">
              <Skeleton className="h-10 w-10 rounded-full" />
              <div className="flex-1 space-y-1">
                <Skeleton className="h-4 w-28" />
                <Skeleton className="h-3 w-20" />
              </div>
            </div>
          ))}
        </div>
      ) : customers.length > 0 ? (
        <div>
          <div className="divide-y">
            {customers.map((customer) => (
              <Link
                key={customer.id}
                to="/shop/admin/customers"
                className="flex-1 flex flex-row items-center gap-3 px-4 py-2 no-underline text-inherit hover:bg-muted/50"
              >
                <Avatar className="w-12 mt-2">
                  <AvatarFallback className="bg-muted text-xs">
                    {getInitials(customer.firstName, customer.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">
                    {customer.firstName} {customer.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {customer.createdAt ? formatDate(customer.createdAt) : 'Recently joined'}
                  </p>
                </div>
              </Link>
            ))}
          </div>
          <div className="flex-grow">&nbsp;</div>
          <div className="p-4 pt-2">
            <Link
              to="/shop/admin/customers"
              className={buttonVariants({ variant: 'outline', size: 'sm' }) + ' w-full'}
            >
              All customers
            </Link>
          </div>
        </div>
      ) : (
        <p className="px-4 pb-4 text-center text-sm text-muted-foreground">
          No customers yet.
        </p>
      )}
    </CardWithIcon>
  )
}
