<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class AdminDeleteProduct
{
    use ApiResponder;

    public function __invoke(string $id): JsonResponse
    {
        $product = Product::find($id);

        if ($product === null) {
            return $this->error('NOT_FOUND', __('api.shop.product_not_found'), 404);
        }

        $product->delete();

        return $this->deleted(__('api.shop.product_deleted'));
    }
}
