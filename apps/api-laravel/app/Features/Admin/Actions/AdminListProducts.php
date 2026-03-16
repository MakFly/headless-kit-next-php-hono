<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class AdminListProducts
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $products = Product::with('category')->orderBy('created_at', 'desc')->get();

        return $this->success($products);
    }
}
