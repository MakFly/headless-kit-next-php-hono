<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Role;
use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class RemoveRole
{
    use ApiResponder;

    public function __invoke(User $user, Role $role): JsonResponse
    {
        $user->removeRole($role);

        return $this->success(['message' => __('api.admin.role_removed')]);
    }
}
