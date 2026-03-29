<?php

declare(strict_types=1);

namespace App\Features\Cart\Formatters;

use App\Shared\Models\Cart;

class CartFormatter
{
    public static function format(Cart $cart): array
    {
        $cart->load('items.product');

        $total = $cart->items->sum(fn ($item) => $item->product->price * $item->quantity);

        return [
            'id' => $cart->id,
            'items' => $cart->items->map(fn ($item) => [
                'id' => $item->id,
                'product_id' => $item->product_id,
                'product' => $item->product ? [
                    'id' => $item->product->id,
                    'name' => $item->product->name,
                    'slug' => $item->product->slug,
                    'price' => $item->product->price,
                    'imageUrl' => $item->product->image_url,
                    'stockQuantity' => $item->product->stock_quantity,
                ] : null,
                'quantity' => $item->quantity,
            ])->values(),
            'total' => $total,
        ];
    }
}
