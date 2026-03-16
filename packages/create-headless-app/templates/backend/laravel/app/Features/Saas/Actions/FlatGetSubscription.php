<?php

declare(strict_types=1);

namespace App\Features\Saas\Actions;

use App\Features\Saas\Formatters\SubscriptionFormatter;
use App\Features\Saas\Services\OrgResolver;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FlatGetSubscription
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $org = OrgResolver::resolveUserOrg($request->user());

        if ($org === null) {
            return $this->success(null);
        }

        $sub = $org->activeSubscription();

        if ($sub === null) {
            return $this->success(null);
        }

        return $this->success(SubscriptionFormatter::format($sub->load('plan')));
    }
}
