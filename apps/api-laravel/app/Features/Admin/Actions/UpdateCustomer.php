<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateCustomer
{
    use ApiResponder;

    public function __invoke(Request $request, string $id): JsonResponse
    {
        $customer = Customer::find($id);

        if ($customer === null) {
            return $this->error('NOT_FOUND', __('api.shop.customer_not_found'), 404);
        }

        $validated = $request->validate([
            'first_name' => ['sometimes', 'string', 'max:255'],
            'last_name' => ['sometimes', 'string', 'max:255'],
            'email' => ['sometimes', 'email', 'unique:customers,email,'.$id],
            'phone' => ['nullable', 'string'],
            'address' => ['nullable', 'array'],
            'segment' => ['nullable', 'string'],
        ]);

        $customer->update($validated);

        return $this->success($customer);
    }
}
