<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUpdateOrderStatus
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $order = Order::find($id);

        if ($order === null) {
            return $this->error('NOT_FOUND', __('api.shop.order_not_found'), 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,confirmed,processing,shipped,delivered,cancelled'],
        ]);

        $order->update(['status' => $validated['status']]);

        return $this->success($order);
    }
}
