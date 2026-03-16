<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatGetUsage
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->success([]);
        }

        $records = $org->usageRecords()->orderByDesc('recorded_at')->get()->map(fn ($r) => [
            'metric'     => $r->metric,
            'value'      => $r->value,
            'limit'      => $r->limit_value,
            'recordedAt' => $r->recorded_at,
        ]);

        return $this->success($records);
    }
}
