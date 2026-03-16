<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Shared\Models\Conversation;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class RatingsStats
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $conversations = Conversation::whereNotNull('rating')->get();

        $total   = $conversations->count();
        $average = $total > 0 ? round($conversations->avg('rating'), 1) : 0;

        $distribution = ['1' => 0, '2' => 0, '3' => 0, '4' => 0, '5' => 0];

        foreach ($conversations as $c) {
            $key = (string) $c->rating;
            if (isset($distribution[$key])) {
                $distribution[$key]++;
            }
        }

        return $this->success([
            'average'      => $average,
            'total'        => $total,
            'distribution' => $distribution,
        ]);
    }
}
