<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Permission;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListPermissions
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        return $this->success(Permission::all());
    }
}
