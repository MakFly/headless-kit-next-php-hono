'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';

type ChartDataPoint = {
  date: string;
  count: number;
  revenue: number;
};

type AdminDashboardChartProps = {
  data: ChartDataPoint[];
};

const chartConfig = {
  revenue: {
    label: 'Revenue',
    color: 'var(--chart-1)',
  },
  count: {
    label: 'Orders',
    color: 'var(--chart-2)',
  },
} satisfies ChartConfig;

export function AdminDashboardChart({ data }: AdminDashboardChartProps) {
  const formatted = data.map((d) => ({
    ...d,
    revenueDisplay: d.revenue / 100,
  }));

  return (
    <ChartContainer config={chartConfig} className="h-[300px] w-full">
      <AreaChart data={formatted}>
        <defs>
          <linearGradient id="gradientRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-revenue)" stopOpacity={0.3} />
            <stop offset="95%" stopColor="var(--color-revenue)" stopOpacity={0.02} />
          </linearGradient>
          <linearGradient id="gradientOrders" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-count)" stopOpacity={0.2} />
            <stop offset="95%" stopColor="var(--color-count)" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid
          strokeDasharray="3 3"
          className="stroke-muted/50"
          vertical={false}
        />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          className="text-xs"
          tickMargin={8}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          className="text-xs"
          tickMargin={8}
        />
        <Tooltip
          content={<ChartTooltipContent />}
          cursor={{ stroke: 'var(--border)', strokeDasharray: '4 4' }}
        />
        <Area
          type="natural"
          dataKey="revenueDisplay"
          name="Revenue ($)"
          stroke="var(--color-revenue)"
          fill="url(#gradientRevenue)"
          strokeWidth={2.5}
          dot={false}
          activeDot={{ r: 5, strokeWidth: 2, fill: 'var(--background)' }}
        />
        <Area
          type="natural"
          dataKey="count"
          name="Orders"
          stroke="var(--color-count)"
          fill="url(#gradientOrders)"
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 4, strokeWidth: 2, fill: 'var(--background)' }}
        />
      </AreaChart>
    </ChartContainer>
  );
}
