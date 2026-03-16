<?php

declare(strict_types=1);

namespace App\Features\Cart\Actions;

use App\Features\Cart\Formatters\CartFormatter;
use App\Shared\Models\Cart;
use App\Shared\Models\CartItem;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateItem
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $request->validate([
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        /** @var CartItem|null $item */
        $item = $cart->items()->find($id);

        if ($item === null) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        if ($request->quantity > $item->product->stock_quantity) {
            return $this->error(
                'VALIDATION_ERROR',
                __('api.shop.stock_exceeded'),
                422,
                ['quantity' => [__('api.shop.stock_exceeded')]]
            );
        }

        $item->update(['quantity' => $request->quantity]);

        return $this->success(CartFormatter::format($cart->fresh()));
    }
}
