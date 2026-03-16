<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateInventory
{
    use ApiResponder;

    public function __invoke(Request $request, string $productId): JsonResponse
    {
        $product = Product::find($productId);

        if ($product === null) {
            return $this->error('NOT_FOUND', __('api.shop.product_not_found'), 404);
        }

        $validated = $request->validate([
            'stock_quantity' => ['required', 'integer', 'min:0'],
        ]);

        $product->update(['stock_quantity' => $validated['stock_quantity']]);

        return $this->success([
            'id'            => $product->id,
            'stockQuantity' => $product->stock_quantity,
        ]);
    }
}
