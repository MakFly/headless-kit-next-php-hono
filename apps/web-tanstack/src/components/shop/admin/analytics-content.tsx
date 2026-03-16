import { useEffect, useState } from 'react'
import {
  getRevenueAnalyticsFn,
  getTopProductsFn,
} from '@/lib/services/admin-service'
import type { RevenueAnalytics, TopProduct } from '@/types/shop'
import { formatPrice } from '@/components/shop/admin/format'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
} satisfies ChartConfig

export function AdminAnalyticsContent() {
  const [analytics, setAnalytics] = useState<RevenueAnalytics | null>(null)
  const [topProducts, setTopProducts] = useState<TopProduct[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([getRevenueAnalyticsFn(), getTopProductsFn()])
      .then(([a, tp]) => {
        setAnalytics(a)
        setTopProducts(tp)
      })
      .catch(() => {
        setAnalytics(null)
        setTopProducts(null)
      })
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-[400px] w-full" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Revenue Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue by Month</CardTitle>
          {analytics && (
            <p className="text-sm text-muted-foreground">
              Total Revenue: {formatPrice(analytics.totalRevenue)}
            </p>
          )}
        </CardHeader>
        <CardContent>
          {analytics && analytics.revenueByMonth.length > 0 ? (
            <ChartContainer config={chartConfig} className="h-[350px] w-full">
              <BarChart
                data={analytics.revenueByMonth.map((d) => ({
                  ...d,
                  revenueDisplay: d.revenue / 100,
                }))}
              >
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis
                  dataKey="month"
                  tickLine={false}
                  axisLine={false}
                  className="text-xs"
                />
                <YAxis tickLine={false} axisLine={false} className="text-xs" />
                <Tooltip content={<ChartTooltipContent />} />
                <Bar
                  dataKey="revenueDisplay"
                  name="Revenue ($)"
                  fill="var(--color-revenue)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ChartContainer>
          ) : (
            <p className="text-sm text-muted-foreground">
              No revenue data available.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Top Products */}
      <Card>
        <CardHeader>
          <CardTitle>Top Products</CardTitle>
        </CardHeader>
        <CardContent>
          {topProducts && topProducts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]">#</TableHead>
                  <TableHead>Product</TableHead>
                  <TableHead>Units Sold</TableHead>
                  <TableHead>Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((tp, i) => (
                  <TableRow key={tp.product.id}>
                    <TableCell className="font-medium">{i + 1}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        {tp.product.imageUrl ? (
                          <img
                            src={tp.product.imageUrl}
                            alt={tp.product.name}
                            className="h-8 w-8 rounded object-cover"
                          />
                        ) : (
                          <div className="h-8 w-8 rounded bg-muted" />
                        )}
                        <span className="font-medium">{tp.product.name}</span>
                      </div>
                    </TableCell>
                    <TableCell>{tp.totalSold}</TableCell>
                    <TableCell>{formatPrice(tp.totalRevenue)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="text-sm text-muted-foreground">
              No top products data available.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
