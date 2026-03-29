<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class TopProducts
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $topProducts = DB::table('order_items')
            ->join('products', 'order_items.product_id', '=', 'products.id')
            ->select(
                'products.id',
                'products.name',
                'products.slug',
                'products.price',
                DB::raw('sum(order_items.quantity) as total_sold'),
                DB::raw('sum(order_items.subtotal) as total_revenue')
            )
            ->groupBy('products.id', 'products.name', 'products.slug', 'products.price')
            ->orderByDesc('total_sold')
            ->limit(10)
            ->get()
            ->map(fn ($row) => [
                'id' => $row->id,
                'name' => $row->name,
                'slug' => $row->slug,
                'price' => $row->price,
                'totalSold' => (int) $row->total_sold,
                'totalRevenue' => (int) $row->total_revenue,
            ]);

        return $this->success($topProducts);
    }
}
