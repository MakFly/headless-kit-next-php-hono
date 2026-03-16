<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Review;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateReview
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $review = Review::find($id);

        if ($review === null) {
            return $this->error('NOT_FOUND', __('api.shop.review_not_found'), 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:pending,approved,rejected'],
        ]);

        $review->update($validated);

        return $this->success($review);
    }
}
