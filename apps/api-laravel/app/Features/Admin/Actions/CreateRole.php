<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\Role;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CreateRole
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255',
            'slug'        => 'required|string|max:255|unique:roles',
            'description' => 'nullable|string',
        ]);

        $role = Role::create($validated);

        return $this->created($role);
    }
}
