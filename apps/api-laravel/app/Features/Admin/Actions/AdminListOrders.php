<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class AdminListOrders
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $orders = Order::with('items', 'user')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($order) => [
                'id'              => $order->id,
                'status'          => $order->status,
                'total'           => $order->total,
                'paymentStatus'   => $order->payment_status,
                'shippingAddress' => $order->shipping_address,
                'notes'           => $order->notes,
                'userId'          => $order->user_id,
                'itemCount'       => $order->items->count(),
                'createdAt'       => $order->created_at,
            ]);

        return $this->success($orders);
    }
}
