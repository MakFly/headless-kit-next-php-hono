<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AssignRole
{
    use ApiResponder;

    public function __invoke(User $user, Request $request): JsonResponse
    {
        $validated = $request->validate(['role' => 'required|string|exists:roles,slug']);
        $user->assignRole($validated['role']);

        return $this->success($user->load('roles'), 200, ['message' => __('api.admin.role_assigned')]);
    }
}
