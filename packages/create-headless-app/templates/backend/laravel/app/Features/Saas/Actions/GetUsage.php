<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetUsage
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org     = $request->attributes->get('org');
        $records = $org->usageRecords()->orderByDesc('recorded_at')->get()->map(fn ($r) => [
            'metric'     => $r->metric,
            'value'      => $r->value,
            'limit'      => $r->limit_value,
            'recordedAt' => $r->recorded_at,
        ]);

        return $this->success($records);
    }
}
