<?php

declare(strict_types=1);

namespace App\Features\Shop\Actions;

use App\Shared\Models\Category;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListCategories
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $categories = Category::withCount('products')
            ->orderBy('sort_order')
            ->get()
            ->map(fn ($category) => array_merge(
                $category->toArray(),
                ['productCount' => $category->products_count]
            ));

        return $this->success($categories);
    }
}
