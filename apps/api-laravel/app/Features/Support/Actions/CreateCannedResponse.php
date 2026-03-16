<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\CannedResponseFormatter;
use App\Shared\Models\CannedResponse;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateCannedResponse
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'title'    => ['required', 'string', 'max:255'],
            'content'  => ['required', 'string'],
            'category' => ['nullable', 'string'],
            'shortcut' => ['nullable', 'string'],
        ]);

        $canned = CannedResponse::create(array_merge($validated, [
            'created_by' => $user->id,
        ]));

        return $this->created(CannedResponseFormatter::format($canned));
    }
}
