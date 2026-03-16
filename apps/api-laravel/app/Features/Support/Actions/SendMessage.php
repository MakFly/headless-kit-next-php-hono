<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Shared\Models\Conversation;
use App\Shared\Models\Message;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SendMessage
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user         = $request->user();
        $conversation = Conversation::find($id);

        if ($conversation === null) {
            return $this->error('NOT_FOUND', __('api.support.conversation_not_found'), 404);
        }

        if ($conversation->user_id !== $user->id) {
            return $this->error('ACCESS_DENIED', __('api.common.forbidden'), 403);
        }

        if ($conversation->isClosed()) {
            return $this->error('VALIDATION_ERROR', __('api.support.conversation_closed'), 422);
        }

        $validated = $request->validate([
            'content' => ['required', 'string'],
        ]);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'sender_type'     => 'user',
            'content'         => $validated['content'],
        ]);

        $conversation->update(['last_message_at' => now()]);

        return $this->created([
            'id'         => $message->id,
            'senderId'   => $message->sender_id,
            'senderType' => $message->sender_type,
            'content'    => $message->content,
            'createdAt'  => $message->created_at,
        ]);
    }
}
