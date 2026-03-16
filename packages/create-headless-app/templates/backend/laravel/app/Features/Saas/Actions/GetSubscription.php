<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Formatters\SubscriptionFormatter;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class GetSubscription
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org = $request->attributes->get('org');
        $sub = $org->activeSubscription();

        if ($sub === null) {
            return $this->success(null);
        }

        return $this->success(SubscriptionFormatter::format($sub->load('plan')));
    }
}
