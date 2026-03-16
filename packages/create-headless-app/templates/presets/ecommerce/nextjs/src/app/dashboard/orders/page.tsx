'use client';

const mockOrders = [
  { id: 'ORD-001', customer: 'John Doe', email: 'john@example.com', total: 349.98, status: 'completed', items: 2, date: '2024-01-15' },
  { id: 'ORD-002', customer: 'Jane Smith', email: 'jane@example.com', total: 129.99, status: 'processing', items: 1, date: '2024-01-14' },
  { id: 'ORD-003', customer: 'Bob Wilson', email: 'bob@example.com', total: 519.97, status: 'shipped', items: 3, date: '2024-01-13' },
  { id: 'ORD-004', customer: 'Alice Brown', email: 'alice@example.com', total: 79.99, status: 'pending', items: 1, date: '2024-01-12' },
  { id: 'ORD-005', customer: 'Charlie Davis', email: 'charlie@example.com', total: 234.98, status: 'completed', items: 2, date: '2024-01-11' },
];

const statusColors: Record<string, string> = {
  completed: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  processing: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  shipped: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  pending: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
};

export default function AdminOrdersPage() {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Orders</h1>
      <div className="rounded-lg border border-border">
        <table className="w-full">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="px-4 py-3 text-left text-sm font-medium">Order ID</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Customer</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Items</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Total</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Status</th>
              <th className="px-4 py-3 text-left text-sm font-medium">Date</th>
            </tr>
          </thead>
          <tbody>
            {mockOrders.map((order) => (
              <tr key={order.id} className="border-b border-border last:border-0">
                <td className="px-4 py-3 text-sm font-mono">{order.id}</td>
                <td className="px-4 py-3">
                  <div className="text-sm font-medium">{order.customer}</div>
                  <div className="text-xs text-muted-foreground">{order.email}</div>
                </td>
                <td className="px-4 py-3 text-sm">{order.items}</td>
                <td className="px-4 py-3 text-sm font-medium">${order.total.toFixed(2)}</td>
                <td className="px-4 py-3">
                  <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium capitalize ${statusColors[order.status]}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm text-muted-foreground">{order.date}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
