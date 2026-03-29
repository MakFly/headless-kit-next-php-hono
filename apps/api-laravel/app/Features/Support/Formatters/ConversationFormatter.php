<?php

declare(strict_types=1);

namespace App\Features\Support\Formatters;

use App\Shared\Models\Conversation;

class ConversationFormatter
{
    public static function format(Conversation $c): array
    {
        return [
            'id' => $c->id,
            'subject' => $c->subject,
            'status' => $c->status,
            'priority' => $c->priority,
            'rating' => $c->rating,
            'lastMessageAt' => $c->last_message_at,
            'createdAt' => $c->created_at,
        ];
    }

    public static function formatWithMessages(Conversation $c): array
    {
        return array_merge(self::format($c), [
            'messages' => $c->messages->map(fn ($m) => [
                'id' => $m->id,
                'senderId' => $m->sender_id,
                'senderType' => $m->sender_type,
                'content' => $m->content,
                'createdAt' => $m->created_at,
            ])->values(),
        ]);
    }
}
