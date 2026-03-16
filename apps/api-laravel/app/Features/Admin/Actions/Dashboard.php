<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Models\Order;
use App\Shared\Models\Review;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class Dashboard
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $now          = now();
        $startOfMonth = $now->copy()->startOfMonth();

        $monthlyRevenue = Order::whereBetween('created_at', [$startOfMonth, $now])
            ->whereNotIn('status', ['cancelled'])
            ->sum('total');

        $nbNewOrders    = Order::whereBetween('created_at', [$startOfMonth, $now])->count();
        $newCustomers   = Customer::whereBetween('created_at', [$startOfMonth, $now])->count();
        $pendingOrders  = Order::where('status', 'pending')->count();
        $pendingReviews = Review::where('status', 'pending')->count();

        return $this->success([
            'monthlyRevenue' => $monthlyRevenue,
            'nbNewOrders'    => $nbNewOrders,
            'newCustomers'   => $newCustomers,
            'pendingOrders'  => $pendingOrders,
            'pendingReviews' => $pendingReviews,
        ]);
    }
}
