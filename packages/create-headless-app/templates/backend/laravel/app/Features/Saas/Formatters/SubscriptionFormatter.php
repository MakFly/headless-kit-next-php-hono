<?php

declare(strict_types=1);

namespace App\Features\Saas\Formatters;

use App\Shared\Models\Subscription;

class SubscriptionFormatter
{
    public static function format(Subscription $sub): array
    {
        return [
            'id'                 => $sub->id,
            'plan'               => $sub->relationLoaded('plan') && $sub->plan ? [
                'id'           => $sub->plan->id,
                'name'         => $sub->plan->name,
                'slug'         => $sub->plan->slug,
                'priceMonthly' => $sub->plan->price_monthly,
                'priceYearly'  => $sub->plan->price_yearly,
            ] : null,
            'status'             => $sub->status,
            'currentPeriodStart' => $sub->current_period_start,
            'currentPeriodEnd'   => $sub->current_period_end,
        ];
    }
}
