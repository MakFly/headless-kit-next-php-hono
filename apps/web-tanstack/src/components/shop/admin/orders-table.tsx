import { useCallback, useEffect, useState } from 'react'
import { Download, SlidersHorizontal } from 'lucide-react'
import type { Order, OrderStatus, PaginatedResponse } from '@/types/shop'
import {
  getAdminOrdersFn,
  updateOrderStatusFn,
} from '@/lib/services/admin-service'
import { formatDate, formatPrice } from '@/components/shop/admin/format'
import { StatusBadge } from '@/components/shop/admin/status-badge'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Skeleton } from '@/components/ui/skeleton'

const ORDER_STATUSES: Array<OrderStatus> = [
  'pending',
  'confirmed',
  'processing',
  'shipped',
  'delivered',
  'cancelled',
]

type ColumnKey = 'id' | 'customer' | 'items' | 'total' | 'status' | 'payment' | 'date' | 'actions'

const ALL_COLUMNS: Array<{ key: ColumnKey; label: string }> = [
  { key: 'id', label: 'Order ID' },
  { key: 'customer', label: 'Customer' },
  { key: 'items', label: 'Items' },
  { key: 'total', label: 'Total' },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
  { key: 'date', label: 'Date' },
  { key: 'actions', label: 'Actions' },
]

function exportCSV(orders: Array<Order>) {
  const headers = ['Order ID', 'Customer', 'Total', 'Status', 'Payment', 'Date']
  const rows = orders.map((o) => [
    o.id.slice(0, 8),
    o.userId,
    (o.total / 100).toFixed(2),
    o.status,
    o.paymentStatus,
    new Date(o.createdAt).toLocaleDateString(),
  ])
  const csv = [headers, ...rows].map((r) => r.join(',')).join('\n')
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = `orders-${new Date().toISOString().slice(0, 10)}.csv`
  link.click()
  URL.revokeObjectURL(url)
}

export function AdminOrdersTable() {
  const [data, setData] = useState<PaginatedResponse<Order> | null>(null)
  const [statusFilter, setStatusFilter] = useState<OrderStatus | 'all'>('all')
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)
  const [tabCounts, setTabCounts] = useState<Record<string, number>>({})
  const [visibleColumns, setVisibleColumns] = useState<Set<ColumnKey>>(
    new Set(ALL_COLUMNS.map((c) => c.key))
  )

  const fetchOrders = useCallback(async () => {
    setLoading(true)
    try {
      const result = await getAdminOrdersFn({
        data: {
          filters: {
            status: statusFilter === 'all' ? undefined : statusFilter,
            page,
            perPage: 20,
          },
        },
      })
      setData(result)
      setTabCounts((prev) => ({
        ...prev,
        [statusFilter]: result.pagination?.total ?? 0,
      }))
    } catch {
      setData(null)
    } finally {
      setLoading(false)
    }
  }, [statusFilter, page])

  useEffect(() => {
    fetchOrders()
  }, [fetchOrders])

  const handleStatusChange = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatusFn({ data: { id: orderId, status: newStatus } })
      fetchOrders()
    } catch {
      // silently handled
    }
  }

  const toggleColumn = (key: ColumnKey) => {
    setVisibleColumns((prev) => {
      const next = new Set(prev)
      if (next.has(key)) {
        if (next.size > 1) next.delete(key)
      } else {
        next.add(key)
      }
      return next
    })
  }

  const isVisible = (key: ColumnKey) => visibleColumns.has(key)

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <Tabs
          value={statusFilter}
          onValueChange={(v) => {
            setStatusFilter(v as OrderStatus | 'all')
            setPage(1)
          }}
        >
          <TabsList>
            <TabsTrigger value="all" className="gap-1.5">
              All
              {tabCounts['all'] !== undefined && (
                <Badge variant="outline" className="ml-1 hidden md:inline-flex h-5 px-1.5 text-xs">
                  {tabCounts['all']}
                </Badge>
              )}
            </TabsTrigger>
            {ORDER_STATUSES.map((s) => (
              <TabsTrigger key={s} value={s} className="capitalize gap-1.5">
                {s}
                {tabCounts[s] !== undefined && (
                  <Badge variant="outline" className="ml-1 hidden md:inline-flex h-5 px-1.5 text-xs">
                    {tabCounts[s]}
                  </Badge>
                )}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>

        <div className="flex items-center gap-2">
          <Popover>
            <PopoverTrigger asChild>
              <Button variant="outline" size="sm">
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Columns
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-48">
              <p className="text-sm font-medium mb-2">Toggle columns</p>
              <div className="space-y-2">
                {ALL_COLUMNS.map((col) => (
                  <label key={col.key} className="flex items-center gap-2 text-sm cursor-pointer">
                    <Checkbox
                      checked={isVisible(col.key)}
                      onCheckedChange={() => toggleColumn(col.key)}
                    />
                    {col.label}
                  </label>
                ))}
              </div>
            </PopoverContent>
          </Popover>

          <Button
            variant="outline"
            size="sm"
            onClick={() => data && exportCSV(data.data)}
            disabled={!data || data.data.length === 0}
          >
            <Download className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {isVisible('id') && <TableHead>Order ID</TableHead>}
              {isVisible('customer') && <TableHead>Customer</TableHead>}
              {isVisible('items') && <TableHead>Items</TableHead>}
              {isVisible('total') && <TableHead>Total</TableHead>}
              {isVisible('status') && <TableHead>Status</TableHead>}
              {isVisible('payment') && <TableHead>Payment</TableHead>}
              {isVisible('date') && <TableHead>Date</TableHead>}
              {isVisible('actions') && <TableHead className="w-[160px]">Actions</TableHead>}
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i}>
                  {ALL_COLUMNS.filter((c) => isVisible(c.key)).map((_, j) => (
                    <TableCell key={j}>
                      <Skeleton className="h-5 w-20" />
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : data && data.data.length > 0 ? (
              data.data.map((order) => (
                <TableRow key={order.id}>
                  {isVisible('id') && (
                    <TableCell className="font-mono text-sm">
                      #{order.id.slice(0, 8)}
                    </TableCell>
                  )}
                  {isVisible('customer') && (
                    <TableCell>{order.userId}</TableCell>
                  )}
                  {isVisible('items') && (
                    <TableCell>
                      <Badge variant="secondary">{order.items.length}</Badge>
                    </TableCell>
                  )}
                  {isVisible('total') && (
                    <TableCell className="font-medium">{formatPrice(order.total)}</TableCell>
                  )}
                  {isVisible('status') && (
                    <TableCell>
                      <StatusBadge status={order.status} />
                    </TableCell>
                  )}
                  {isVisible('payment') && (
                    <TableCell>
                      <StatusBadge status={order.paymentStatus} />
                    </TableCell>
                  )}
                  {isVisible('date') && (
                    <TableCell>{formatDate(order.createdAt)}</TableCell>
                  )}
                  {isVisible('actions') && (
                    <TableCell>
                      <Select
                        value={order.status}
                        onValueChange={(v) =>
                          handleStatusChange(order.id, v as OrderStatus)
                        }
                      >
                        <SelectTrigger className="h-8 w-[140px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ORDER_STATUSES.map((s) => (
                            <SelectItem key={s} value={s} className="capitalize">
                              {s}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                  )}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={ALL_COLUMNS.filter((c) => isVisible(c.key)).length}
                  className="text-center text-muted-foreground"
                >
                  No orders found.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {data && data.pagination.last_page > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">
            Page {data.pagination.page} of {data.pagination.last_page} ({data.pagination.total} total)
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
            >
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= data.pagination.last_page}
              onClick={() => setPage((p) => p + 1)}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
