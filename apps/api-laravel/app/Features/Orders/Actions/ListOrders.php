<?php

declare(strict_types=1);

namespace App\Features\Orders\Actions;

use App\Features\Orders\Formatters\OrderFormatter;
use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListOrders
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $orders = Order::where('user_id', $request->user()->id)
            ->with('items')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($order) => OrderFormatter::format($order));

        return $this->success($orders);
    }
}
