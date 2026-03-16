<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Review;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ShowReview
{
    use ApiResponder;

    public function __invoke(string $id): JsonResponse
    {
        $review = Review::with('product', 'customer')->find($id);

        if ($review === null) {
            return $this->error('NOT_FOUND', __('api.shop.review_not_found'), 404);
        }

        return $this->success($review);
    }
}
