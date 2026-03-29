<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminCreateProduct
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'slug' => ['required', 'string', 'unique:products,slug'],
            'description' => ['nullable', 'string'],
            'price' => ['required', 'integer', 'min:0'],
            'compare_at_price' => ['nullable', 'integer', 'min:0'],
            'sku' => ['nullable', 'string'],
            'stock_quantity' => ['required', 'integer', 'min:0'],
            'category_id' => ['nullable', 'uuid', 'exists:categories,id'],
            'image_url' => ['nullable', 'string'],
            'images' => ['nullable', 'array'],
            'status' => ['in:active,draft,archived'],
            'featured' => ['boolean'],
        ]);

        $product = Product::create($validated);

        return $this->created($product->load('category'));
    }
}
