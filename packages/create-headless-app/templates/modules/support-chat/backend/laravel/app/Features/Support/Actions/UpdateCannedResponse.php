<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\CannedResponseFormatter;
use App\Shared\Models\CannedResponse;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateCannedResponse
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $canned = CannedResponse::find($id);

        if ($canned === null) {
            return $this->error('NOT_FOUND', __('api.support.canned_not_found'), 404);
        }

        $validated = $request->validate([
            'title'    => ['sometimes', 'string', 'max:255'],
            'content'  => ['sometimes', 'string'],
            'category' => ['nullable', 'string'],
            'shortcut' => ['nullable', 'string'],
        ]);

        $canned->update($validated);

        return $this->success(CannedResponseFormatter::format($canned));
    }
}
