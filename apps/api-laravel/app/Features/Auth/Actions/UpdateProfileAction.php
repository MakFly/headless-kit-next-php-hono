<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class UpdateProfileAction
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'name'  => ['sometimes', 'string', 'min:2', 'max:255'],
            'email' => ['sometimes', 'email', 'max:255'],
        ]);

        if (!$request->hasAny(['name', 'email'])) {
            return $this->error('VALIDATION_ERROR', 'No fields provided for update.', 422);
        }

        /** @var User $user */
        $user = $request->user();

        if ($request->has('email')) {
            $email = strtolower($request->string('email')->value());

            // Uniqueness check excluding the current user
            $emailTaken = User::where('email', $email)
                ->where('id', '!=', $user->id)
                ->exists();

            if ($emailTaken) {
                return $this->error('CONFLICT', 'This email address is already in use.', 409);
            }

            $user->email = $email;
        }

        if ($request->has('name')) {
            $user->name = $request->string('name')->value();
        }

        $user->save();

        $user->load('roles');

        return $this->success([
            'user' => $user->toArray(),
        ]);
    }
}
