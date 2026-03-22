<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Mail\PasswordResetMail;
use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;

class ForgotPasswordAction
{
    use ApiResponder;

    private const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'email' => ['required', 'email'],
        ]);

        // Always return 200 — email-enumeration safe
        $safeResponse = $this->success([
            'message' => 'If an account with that email exists, a password reset link has been sent.',
        ]);

        $user = User::where('email', $request->string('email')->lower()->value())->first();

        if ($user === null) {
            return $safeResponse;
        }

        // Generate a secure random token
        $plainToken = Str::random(64);
        $hashedToken = Hash::make($plainToken);

        // Upsert: one token per email at a time
        DB::table('password_reset_tokens')->upsert(
            [
                'email'      => $user->email,
                'token'      => $hashedToken,
                'created_at' => now(),
            ],
            uniqueBy: ['email'],
            update: ['token', 'created_at'],
        );

        // Send email (falls back to log driver in dev)
        try {
            Mail::to($user->email)->send(new PasswordResetMail($plainToken, $user->email));
        } catch (\Throwable $e) {
            Log::warning('PasswordResetMail send failed', [
                'email' => $user->email,
                'error' => $e->getMessage(),
            ]);
        }

        return $safeResponse;
    }
}
