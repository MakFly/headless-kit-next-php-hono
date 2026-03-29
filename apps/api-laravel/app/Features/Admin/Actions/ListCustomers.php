<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Customer;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListCustomers
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 20)));
        $page = max(1, (int) $request->input('page', 1));

        $query = Customer::orderBy('created_at', 'desc');

        $total = $query->count();
        $customers = $query->forPage($page, $perPage)->get();

        return $this->paginated($customers, $page, $perPage, $total);
    }
}
