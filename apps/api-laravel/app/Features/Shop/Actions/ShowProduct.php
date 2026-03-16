<?php

declare(strict_types=1);

namespace App\Features\Shop\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ShowProduct
{
    use ApiResponder;

    public function __invoke(string $slug): JsonResponse
    {
        $product = Product::with('category')->where('slug', $slug)->first();

        if ($product === null) {
            return $this->error('NOT_FOUND', __('api.shop.product_not_found'), 404);
        }

        return $this->success($product);
    }
}
