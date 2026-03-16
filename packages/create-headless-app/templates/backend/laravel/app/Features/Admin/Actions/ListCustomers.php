<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListCustomers
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        return $this->success(Customer::orderBy('created_at', 'desc')->get());
    }
}
