<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Helpers\ApiResponse;
use App\Shared\Models\Review;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class BulkRejectReviews
{
    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'ids' => ['required', 'array'],
            'ids.*' => ['uuid'],
        ]);

        $count = Review::whereIn('id', $validated['ids'])->update(['status' => 'rejected']);

        return ApiResponse::success(['count' => $count]);
    }
}
