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
        $query = Review::with('product', 'customer');

        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        if ($request->filled('rating')) {
            $query->where('rating', (int) $request->rating);
        }

        return $this->success($query->orderBy('created_at', 'desc')->get());
    }
}
