<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Review;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListReviews
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $query = Review::with('product', 'customer');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
        }

        $query->orderBy('created_at', 'desc');

        $total = $query->count();
        $reviews = $query->forPage($page, $perPage)->get();

        return $this->paginated($reviews, $page, $perPage, $total);
    }
}
