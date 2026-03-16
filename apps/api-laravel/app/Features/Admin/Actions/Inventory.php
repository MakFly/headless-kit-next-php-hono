<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class Inventory
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $products = Product::with('category')
            ->select('id', 'name', 'slug', 'sku', 'stock_quantity', 'status', 'category_id')
            ->orderBy('stock_quantity', 'asc')
            ->get()
            ->map(fn ($p) => [
                'id'            => $p->id,
                'name'          => $p->name,
                'slug'          => $p->slug,
                'sku'           => $p->sku,
                'stockQuantity' => $p->stock_quantity,
                'status'        => $p->status,
                'category'      => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name] : null,
            ]);

        return $this->success($products);
    }
}
