<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowConversation
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user         = $request->user();
        $conversation = Conversation::with('messages')->find($id);

        if ($conversation === null) {
            return $this->error('NOT_FOUND', __('api.support.conversation_not_found'), 404);
        }

        if ($conversation->user_id !== $user->id) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        return $this->success(ConversationFormatter::formatWithMessages($conversation));
    }
}
