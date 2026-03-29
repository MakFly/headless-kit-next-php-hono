<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatListInvoices
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->success([]);
        }

        $invoices = $org->invoices()->orderByDesc('created_at')->get()->map(fn ($inv) => [
            'id' => $inv->id,
            'amount' => $inv->amount,
            'status' => $inv->status,
            'periodStart' => $inv->period_start,
            'periodEnd' => $inv->period_end,
            'paidAt' => $inv->paid_at,
        ]);

        return $this->success($invoices);
    }
}
