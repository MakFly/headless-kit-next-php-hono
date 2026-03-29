<?php

declare(strict_types=1);

namespace App\Features\Cart\Actions;

use App\Features\Cart\Formatters\CartFormatter;
use App\Shared\Models\Cart;
use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AddItem
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'product_id' => ['required', 'string'],
            'quantity' => ['required', 'integer', 'min:1'],
        ]);

        $product = Product::where('id', $request->product_id)
            ->where('status', 'active')
            ->first();

        if ($product === null) {
            return $this->error('NOT_FOUND', __('api.shop.product_not_found'), 404);
        }

        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);
        $existingItem = $cart->items()->where('product_id', $product->id)->first();
        $newQuantity = ($existingItem?->quantity ?? 0) + $request->quantity;

        if ($newQuantity > $product->stock_quantity) {
            return $this->error(
                'VALIDATION_ERROR',
                __('api.shop.stock_exceeded'),
                422,
                ['quantity' => [__('api.shop.stock_exceeded')]]
            );
        }

        if ($existingItem) {
            $existingItem->update(['quantity' => $newQuantity]);
        } else {
            $cart->items()->create([
                'product_id' => $product->id,
                'quantity' => $request->quantity,
            ]);
        }

        return $this->created(CartFormatter::format($cart->fresh()));
    }
}
