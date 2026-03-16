<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AgentAssigned
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\User $user */
        $user = $request->user();

        $conversations = Conversation::where('agent_id', $user->id)
            ->whereIn('status', ['assigned', 'waiting'])
            ->orderByDesc('last_message_at')
            ->get()
            ->map(fn ($c) => ConversationFormatter::format($c));

        return $this->success($conversations);
    }
}
