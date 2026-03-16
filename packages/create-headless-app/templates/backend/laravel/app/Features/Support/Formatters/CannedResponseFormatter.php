<?php

declare(strict_types=1);

namespace App\Features\Support\Formatters;

use App\Shared\Models\CannedResponse;

class CannedResponseFormatter
{
    public static function format(CannedResponse $c): array
    {
        return [
            'id'       => $c->id,
            'title'    => $c->title,
            'content'  => $c->content,
            'category' => $c->category,
            'shortcut' => $c->shortcut,
        ];
    }
}
