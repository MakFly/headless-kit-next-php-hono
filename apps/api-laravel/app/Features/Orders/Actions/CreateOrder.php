<?php

declare(strict_types=1);

namespace App\Features\Orders\Actions;

use App\Features\Orders\Formatters\OrderFormatter;
use App\Shared\Models\Cart;
use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class CreateOrder
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'shipping_address' => ['required', 'array'],
            'shipping_address.street' => ['required', 'string'],
            'shipping_address.city' => ['required', 'string'],
            'shipping_address.state' => ['required', 'string'],
            'shipping_address.zip' => ['required', 'string'],
            'shipping_address.country' => ['required', 'string'],
            'notes' => ['nullable', 'string'],
        ]);

        $cart = Cart::where('user_id', $request->user()->id)
            ->with('items.product')
            ->first();

        if ($cart === null || $cart->items->isEmpty()) {
            return $this->error(
                'VALIDATION_ERROR',
                __('api.shop.cart_empty'),
                422,
                ['cart' => [__('api.shop.cart_empty')]]
            );
        }

        $order = DB::transaction(function () use ($request, $cart) {
            $total = $cart->items->sum(fn ($item) => $item->product->price * $item->quantity);

            $order = Order::create([
                'user_id' => $request->user()->id,
                'status' => 'pending',
                'total' => $total,
                'shipping_address' => $request->shipping_address,
                'payment_status' => 'pending',
                'notes' => $request->notes,
            ]);

            foreach ($cart->items as $item) {
                $order->items()->create([
                    'product_id' => $item->product_id,
                    'product_name' => $item->product->name,
                    'product_price' => $item->product->price,
                    'quantity' => $item->quantity,
                    'subtotal' => $item->product->price * $item->quantity,
                ]);

                $item->product->decrement('stock_quantity', $item->quantity);
            }

            $cart->items()->delete();

            return $order;
        });

        return $this->created(OrderFormatter::format($order));
    }
}
