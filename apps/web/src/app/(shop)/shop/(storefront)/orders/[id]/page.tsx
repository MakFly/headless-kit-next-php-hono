import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { getOrderAction } from '@/lib/actions/shop/orders';
import { ArrowLeft } from 'lucide-react';
import type { OrderStatus, PaymentStatus } from '@/types/shop';

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

export default async function OrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  let order;
  let error: string | null = null;

  try {
    order = await getOrderAction(id);
  } catch (err) {
    error = err instanceof Error ? err.message : 'Failed to load order';
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <Link
        href="/shop/orders"
        className="mb-8 inline-flex items-center gap-1.5 text-[11px] uppercase tracking-[0.15em] text-stone-400 transition-colors hover:text-stone-900"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        All Orders
      </Link>

      <h1 className="mb-8 font-serif text-3xl text-stone-900">
        Order #{id.slice(0, 8).toUpperCase()}
      </h1>

      {error ? (
        <div className="py-16 text-center">
          <p className="text-sm text-stone-500">{error}</p>
        </div>
      ) : order ? (
        <div className="grid gap-8 lg:grid-cols-3">
          {/* Items */}
          <div className="lg:col-span-2">
            <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
              Items
            </h2>
            <div className="divide-y divide-stone-200 border-y border-stone-200">
              {order.items?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-stone-900">
                      {item.productName}
                    </p>
                    <p className="text-xs text-stone-400">
                      {formatPrice(item.productPrice)} &times; {item.quantity}
                    </p>
                  </div>
                  <p className="shrink-0 text-sm font-medium text-stone-900">
                    {formatPrice(item.subtotal)}
                  </p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex justify-end">
              <div className="flex items-center gap-4">
                <span className="text-sm text-stone-500">Total</span>
                <span className="text-lg font-medium text-stone-900">
                  {formatPrice(order.total)}
                </span>
              </div>
            </div>
          </div>

          {/* Order info sidebar */}
          <div className="space-y-6">
            <div className="bg-stone-50 p-6">
              <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
                Order Info
              </h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Status</span>
                  <Badge
                    variant={statusVariant[order.status]}
                    className="rounded-none text-[10px] uppercase tracking-wider"
                  >
                    {order.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-stone-500">Payment</span>
                  <Badge
                    variant={paymentVariant[order.paymentStatus]}
                    className="rounded-none text-[10px] uppercase tracking-wider"
                  >
                    {order.paymentStatus}
                  </Badge>
                </div>
                <Separator className="bg-stone-200" />
                <div className="flex justify-between">
                  <span className="text-xs text-stone-500">Date</span>
                  <span className="text-xs text-stone-900">
                    {new Date(order.createdAt).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric',
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-xs text-stone-500">Total</span>
                  <span className="text-sm font-medium text-stone-900">
                    {formatPrice(order.total)}
                  </span>
                </div>
              </div>
            </div>

            {order.shippingAddress && (
              <div className="bg-stone-50 p-6">
                <h2 className="mb-4 text-[11px] font-medium uppercase tracking-[0.2em] text-stone-900">
                  Shipping Address
                </h2>
                <div className="space-y-1 text-xs text-stone-600">
                  <p>{order.shippingAddress.street}</p>
                  <p>
                    {order.shippingAddress.city},{' '}
                    {order.shippingAddress.state}{' '}
                    {order.shippingAddress.zip}
                  </p>
                  <p>{order.shippingAddress.country}</p>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  );
}
