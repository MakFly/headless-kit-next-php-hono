<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignConversation
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

        if ($conversation->agent_id !== null) {
            return $this->error('CONFLICT', __('api.support.already_assigned'), 409);
        }

        $conversation->update([
            'agent_id' => $user->id,
            'status' => 'assigned',
        ]);

        return $this->success(ConversationFormatter::format($conversation));
    }
}
