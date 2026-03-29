<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminListProducts
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $query = Product::with('category')->orderBy('created_at', 'desc');

        $total = $query->count();
        $products = $query->forPage($page, $perPage)->get();

        return $this->paginated($products, $page, $perPage, $total);
    }
}
