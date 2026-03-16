<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ShowCustomer
{
    use ApiResponder;

    public function __invoke(string $id): JsonResponse
    {
        $customer = Customer::with('reviews.product')->find($id);

        if ($customer === null) {
            return $this->error('NOT_FOUND', __('api.shop.customer_not_found'), 404);
        }

        return $this->success($customer);
    }
}
