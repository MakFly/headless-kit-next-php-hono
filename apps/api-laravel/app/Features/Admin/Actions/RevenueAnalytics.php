<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Order;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class RevenueAnalytics
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $totalRevenue = Order::whereNotIn('status', ['cancelled'])->sum('total');

        $revenueByMonth = Order::whereNotIn('status', ['cancelled'])
            ->selectRaw("strftime('%Y-%m', created_at) as month, sum(total) as revenue")
            ->groupByRaw("strftime('%Y-%m', created_at)")
            ->orderByRaw("strftime('%Y-%m', created_at) desc")
            ->limit(12)
            ->get()
            ->map(fn ($row) => [
                'month' => $row->month,
                'revenue' => (int) $row->revenue,
            ]);

        return $this->success([
            'totalRevenue' => $totalRevenue,
            'revenueByMonth' => $revenueByMonth,
        ]);
    }
}
