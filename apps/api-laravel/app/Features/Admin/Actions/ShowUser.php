<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ShowUser
{
    use ApiResponder;

    public function __invoke(User $user): JsonResponse
    {
        return $this->success($user->load('roles.permissions'));
    }
}
