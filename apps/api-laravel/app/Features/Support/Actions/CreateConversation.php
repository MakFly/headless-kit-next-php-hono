<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Models\Message;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateConversation
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $validated = $request->validate([
            'subject'  => ['required', 'string', 'max:255'],
            'message'  => ['required', 'string'],
            'priority' => ['sometimes', 'in:low,medium,high,urgent'],
        ]);

        $conversation = Conversation::create([
            'user_id'         => $user->id,
            'subject'         => $validated['subject'],
            'status'          => 'open',
            'priority'        => $validated['priority'] ?? 'medium',
            'last_message_at' => now(),
        ]);

        Message::create([
            'conversation_id' => $conversation->id,
            'sender_id'       => $user->id,
            'sender_type'     => 'user',
            'content'         => $validated['message'],
        ]);

        return $this->created(ConversationFormatter::format($conversation));
    }
}
