<?php

declare(strict_types=1);

namespace App\Features\Orders\Actions;

use App\Features\Orders\Formatters\OrderFormatter;
use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowOrder
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $order = Order::with('items')->find($id);

        if ($order === null) {
            return $this->error('NOT_FOUND', __('api.shop.order_not_found'), 404);
        }

        if ($order->user_id !== $request->user()->id) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        return $this->success(OrderFormatter::format($order));
    }
}
