<?php

declare(strict_types=1);

namespace App\Features\Cart\Actions;

use App\Features\Cart\Formatters\CartFormatter;
use App\Shared\Models\Cart;
use App\Shared\Models\CartItem;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RemoveItem
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        /** @var CartItem|null $item */
        $item = $cart->items()->find($id);

        if ($item === null) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        $item->delete();

        return $this->success(CartFormatter::format($cart->fresh()));
    }
}
