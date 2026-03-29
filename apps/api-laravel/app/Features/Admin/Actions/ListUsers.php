<?php

declare(strict_types=1);

namespace App\Features\Admin\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ListUsers
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $perPage = min(100, max(1, (int) $request->input('per_page', 15)));
        $page = max(1, (int) $request->input('page', 1));

        $query = User::with('roles');
        $total = $query->count();
        $users = $query->forPage($page, $perPage)->get();

        return $this->paginated($users, $page, $perPage, $total);
    }
}
