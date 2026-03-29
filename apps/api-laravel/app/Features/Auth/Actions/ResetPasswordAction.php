<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;

class ResetPasswordAction
{
    use ApiResponder;

    private const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
            'newPassword' => ['required', 'string', Password::min(8)->mixedCase()->numbers()],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('created_at', '>=', now()->subSeconds(self::TOKEN_EXPIRY_SECONDS))
            ->get()
            ->first(fn (object $row) => Hash::check($request->string('token')->value(), $row->token));

        if ($record === null) {
            return $this->error('INVALID_TOKEN', 'This password reset token is invalid or has expired.', 422);
        }

        $user = User::where('email', $record->email)->first();

        if ($user === null) {
            return $this->error('INVALID_TOKEN', 'This password reset token is invalid or has expired.', 422);
        }

        // Update password and invalidate token
        $user->update(['password' => Hash::make($request->string('newPassword')->value())]);

        DB::table('password_reset_tokens')->where('email', $record->email)->delete();

        return $this->success(['message' => 'Password reset successfully.']);
    }
}
