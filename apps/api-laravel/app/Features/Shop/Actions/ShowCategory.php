<?php

declare(strict_types=1);

namespace App\Features\Shop\Actions;

use App\Shared\Models\Category;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ShowCategory
{
    use ApiResponder;

    public function __invoke(string $slug): JsonResponse
    {
        $category = Category::with('products')->where('slug', $slug)->first();

        if ($category === null) {
            return $this->error('NOT_FOUND', __('api.shop.category_not_found'), 404);
        }

        return $this->success($category);
    }
}
