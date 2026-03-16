<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\ConversationFormatter;
use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class AgentQueue
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $conversations = Conversation::whereNull('agent_id')
            ->where('status', 'open')
            ->orderBy('priority', 'desc')
            ->orderBy('created_at', 'asc')
            ->get()
            ->map(fn ($c) => ConversationFormatter::format($c));

        return $this->success($conversations);
    }
}
