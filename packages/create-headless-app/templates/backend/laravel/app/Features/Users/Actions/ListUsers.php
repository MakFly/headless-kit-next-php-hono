<?php

declare(strict_types=1);

namespace App\Features\Users\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListUsers
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        return $this->success(User::with('roles')->get());
    }
}
