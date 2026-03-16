<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Formatters\SubscriptionFormatter;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CancelSubscription
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var \App\Shared\Models\Organization $org */
        $org = $request->attributes->get('org');
        $sub = $org->activeSubscription();

        if ($sub === null) {
            return $this->error('NOT_FOUND', __('api.saas.no_active_subscription'), 404);
        }

        $sub->update(['status' => 'cancelled']);

        return $this->success(SubscriptionFormatter::format($sub->load('plan')));
    }
}
