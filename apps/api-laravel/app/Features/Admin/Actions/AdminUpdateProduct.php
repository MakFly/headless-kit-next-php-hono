<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminUpdateProduct
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $product = Product::find($id);

        if ($product === null) {
            return $this->error('NOT_FOUND', __('api.shop.product_not_found'), 404);
        }

        $validated = $request->validate([
            'name'             => ['sometimes', 'string', 'max:255'],
            'slug'             => ['sometimes', 'string', 'unique:products,slug,' . $id],
            'description'      => ['nullable', 'string'],
            'price'            => ['sometimes', 'integer', 'min:0'],
            'compare_at_price' => ['nullable', 'integer', 'min:0'],
            'sku'              => ['nullable', 'string'],
            'stock_quantity'   => ['sometimes', 'integer', 'min:0'],
            'category_id'      => ['nullable', 'uuid', 'exists:categories,id'],
            'image_url'        => ['nullable', 'string'],
            'images'           => ['nullable', 'array'],
            'status'           => ['in:active,draft,archived'],
            'featured'         => ['boolean'],
        ]);

        $product->update($validated);

        return $this->success($product->load('category'));
    }
}
