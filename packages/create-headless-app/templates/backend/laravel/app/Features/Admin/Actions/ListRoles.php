<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Role;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListRoles
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        return $this->success(Role::with('permissions')->get());
    }
}
