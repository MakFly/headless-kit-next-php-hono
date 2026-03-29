<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Shared\Models\Plan;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListPlans
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $plans = Plan::orderBy('price_monthly')->get()->map(fn ($p) => [
            'id' => $p->id,
            'name' => $p->name,
            'slug' => $p->slug,
            'priceMonthly' => $p->price_monthly,
            'priceYearly' => $p->price_yearly,
            'features' => $p->features ?? [],
            'limits' => $p->limits ?? [],
        ]);

        return $this->success($plans);
    }
}
