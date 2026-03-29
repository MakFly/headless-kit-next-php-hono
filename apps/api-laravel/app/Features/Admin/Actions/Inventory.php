<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class Inventory
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $query = Product::with('category')
            ->select('id', 'name', 'slug', 'sku', 'stock_quantity', 'status', 'category_id')
            ->orderBy('stock_quantity', 'asc');

        $total = $query->count();
        $products = $query->forPage($page, $perPage)->get()
            ->map(fn ($p) => [
                'id' => $p->id,
                'name' => $p->name,
                'slug' => $p->slug,
                'sku' => $p->sku,
                'stockQuantity' => $p->stock_quantity,
                'status' => $p->status,
                'category' => $p->category ? ['id' => $p->category->id, 'name' => $p->category->name] : null,
            ]);

        return $this->paginated($products, $page, $perPage, $total);
    }
}
