<?php

declare(strict_types=1);

namespace App\Features\Shop\Actions;

use App\Shared\Models\Product;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListProducts
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $query = Product::query()->with('category');

        if ($request->filled('category')) {
            $query->whereHas('category', fn ($q) => $q->where('slug', $request->category));
        }

        if ($request->filled('search')) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        if ($request->filled('min_price')) {
            $query->where('price', '>=', (int) $request->min_price);
        }

        if ($request->filled('max_price')) {
            $query->where('price', '<=', (int) $request->max_price);
        }

        match ($request->input('sort', 'newest')) {
            'price_asc'  => $query->orderBy('price', 'asc'),
            'price_desc' => $query->orderBy('price', 'desc'),
            'name_asc'   => $query->orderBy('name', 'asc'),
            default      => $query->orderBy('created_at', 'desc'),
        };

        $perPage  = (int) $request->input('per_page', 12);
        $page     = (int) $request->input('page', 1);
        $total    = $query->count();
        $products = $query->forPage($page, $perPage)->get();

        return $this->paginated($products, $page, $perPage, $total);
    }
}
