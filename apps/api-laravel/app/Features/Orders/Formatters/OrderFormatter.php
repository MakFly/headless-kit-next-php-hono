<?php

declare(strict_types=1);

namespace App\Features\Orders\Formatters;

use App\Shared\Models\Order;

class OrderFormatter
{
    public static function format(Order $order): array
    {
        $order->load('items');

        return [
            'id' => $order->id,
            'status' => $order->status,
            'total' => $order->total,
            'paymentStatus' => $order->payment_status,
            'shippingAddress' => $order->shipping_address,
            'notes' => $order->notes,
            'items' => $order->items->map(fn ($item) => [
                'id' => $item->id,
                'productName' => $item->product_name,
                'productPrice' => $item->product_price,
                'quantity' => $item->quantity,
                'subtotal' => $item->subtotal,
            ])->values(),
            'createdAt' => $order->created_at,
        ];
    }
}
