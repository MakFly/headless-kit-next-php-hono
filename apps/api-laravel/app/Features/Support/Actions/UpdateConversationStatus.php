<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateConversationStatus
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $conversation = Conversation::find($id);

        if ($conversation === null) {
            return $this->error('NOT_FOUND', __('api.support.conversation_not_found'), 404);
        }

        $validated = $request->validate([
            'status' => ['required', 'in:open,assigned,waiting,resolved,closed'],
        ]);

        $validTransitions = [
            'open'     => ['assigned', 'closed'],
            'assigned' => ['waiting', 'resolved', 'closed'],
            'waiting'  => ['assigned', 'resolved', 'closed'],
            'resolved' => ['closed', 'open'],
            'closed'   => [],
        ];

        $currentStatus = $conversation->status;
        $newStatus     = $validated['status'];

        if (! in_array($newStatus, $validTransitions[$currentStatus] ?? [])) {
            return $this->error(
                'VALIDATION_ERROR',
                __('api.support.invalid_transition', ['from' => $currentStatus, 'to' => $newStatus]),
                422
            );
        }

        $conversation->update(['status' => $newStatus]);

        return $this->success(ConversationFormatter::format($conversation));
    }
}
