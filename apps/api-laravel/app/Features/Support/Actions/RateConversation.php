<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class RateConversation
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();
        $conversation = Conversation::find($id);

        if ($conversation === null) {
            return $this->error('NOT_FOUND', __('api.support.conversation_not_found'), 404);
        }

        if ($conversation->user_id !== $user->id) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        $validated = $request->validate([
            'rating' => ['required', 'integer', 'min:1', 'max:5'],
        ]);

        if (! in_array($conversation->status, ['resolved', 'closed'])) {
            return $this->error('VALIDATION_ERROR', __('api.support.conversation_not_closed'), 422);
        }

        if ($conversation->rating !== null) {
            return $this->error('CONFLICT', __('api.support.already_rated'), 409);
        }

        $conversation->update(['rating' => $validated['rating']]);

        return $this->success([
            'id' => $conversation->id,
            'rating' => $conversation->rating,
        ]);
    }
}
