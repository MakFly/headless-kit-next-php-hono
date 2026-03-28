<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Shared\Models\CannedResponse;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class DeleteCannedResponse
{
    use ApiResponder;

    public function __invoke(string $id): JsonResponse
    {
        $canned = CannedResponse::find($id);

        if ($canned === null) {
            return $this->error('NOT_FOUND', __('api.support.canned_not_found'), 404);
        }

        $canned->delete();

        return $this->deleted(__('api.support.canned_deleted'));
    }
}
