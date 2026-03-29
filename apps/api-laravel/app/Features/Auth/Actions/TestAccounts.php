<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class TestAccounts
{
    use ApiResponder;

    private const DEV_PASSWORD = 'Admin1234!';

    public function __invoke(): JsonResponse
    {
        if (app()->environment('production')) {
            return $this->success([]);
        }

        $users = User::with('roles')
            ->orderByDesc('created_at')
            ->limit(20)
            ->get()
            ->map(fn (User $user) => [
                'email' => $user->email,
                'name' => $user->name,
                'password' => self::DEV_PASSWORD,
                'role' => collect($user->roles)->first()?->slug ?? 'user',
            ]);

        return $this->success($users);
    }
}
