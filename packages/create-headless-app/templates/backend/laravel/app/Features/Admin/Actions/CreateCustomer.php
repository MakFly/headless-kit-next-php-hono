<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateCustomer
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'first_name' => ['required', 'string', 'max:255'],
            'last_name'  => ['required', 'string', 'max:255'],
            'email'      => ['required', 'email', 'unique:customers,email'],
            'phone'      => ['nullable', 'string'],
            'address'    => ['nullable', 'array'],
            'segment'    => ['nullable', 'string'],
        ]);

        return $this->created(Customer::create($validated));
    }
}
