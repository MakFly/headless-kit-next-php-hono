import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { getOrdersAction } from '@/lib/actions/shop/orders';
import { ClipboardList, ArrowLeft } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@/types/shop';

const statusLabel: Record<OrderStatus, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  shipped: 'Shipped',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const statusVariant: Record<
  OrderStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  confirmed: 'secondary',
  processing: 'default',
  shipped: 'default',
  delivered: 'secondary',
  cancelled: 'destructive',
};

const paymentVariant: Record<
  PaymentStatus,
  'default' | 'secondary' | 'outline' | 'destructive'
> = {
  pending: 'outline',
  paid: 'secondary',
  failed: 'destructive',
  refunded: 'outline',
};

function formatPrice(cents: number): string {
  return `$${(cents / 100).toFixed(2)}`;
}

export default async function OrdersPage() {
  let orders;
  let error: string | null = null;

  try {
    orders = await getOrdersAction();
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load orders';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/shop"
        className="mb-8 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-400 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        Back to shop
      </Link>

      <h1 className="mb-8 font-serif text-3xl text-stone-900">My Orders</h1>

      {error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500">{error}</p>
        </div>
      ) : !orders || orders.length === 0 ? (
        <div className="flex flex-col items-center py-20 text-center">
          <ClipboardList className="mb-4 h-12 w-12 text-stone-300" />
          <h2 className="mb-2 font-serif text-2xl text-stone-900">
            No orders yet
          </h2>
          <p className="text-sm text-stone-500">
            Your order history will appear here
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <Link key={order.id} href={`/shop/orders/${order.id}`}>
              <div className="group border border-stone-200 p-5 transition-colors hover:border-stone-400">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="mb-1 text-xs text-stone-400">
                      {new Date(order.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <p className="text-sm text-stone-900">
                      Order #{order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="mt-0.5 text-xs text-stone-400">
                      {order.items?.length ?? 0}{' '}
                      {(order.items?.length ?? 0) === 1 ? 'item' : 'items'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={statusVariant[order.status]}
                      className="rounded-none text-[10px] uppercase tracking-wider"
                    >
                      {statusLabel[order.status]}
                    </Badge>
                    <Badge
                      variant={paymentVariant[order.paymentStatus]}
                      className="rounded-none text-[10px] uppercase tracking-wider"
                    >
                      {order.paymentStatus}
                    </Badge>
                    <span className="text-sm font-medium text-stone-900">
                      {formatPrice(order.total)}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
