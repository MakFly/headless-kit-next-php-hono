<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminListOrders
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $query = Order::with('items', 'user')->orderBy('created_at', 'desc');

        $total = $query->count();
        $orders = $query->forPage($page, $perPage)->get()
            ->map(fn ($order) => [
                'id' => $order->id,
                'status' => $order->status,
                'total' => $order->total,
                'paymentStatus' => $order->payment_status,
                'shippingAddress' => $order->shipping_address,
                'notes' => $order->notes,
                'userId' => $order->user_id,
                'itemCount' => $order->items->count(),
                'createdAt' => $order->created_at,
            ]);

        return $this->paginated($orders, $page, $perPage, $total);
    }
}
