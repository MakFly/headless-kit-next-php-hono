<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;

class VerifyResetTokenAction
{
    use ApiResponder;

    private const TOKEN_EXPIRY_SECONDS = 3600; // 1 hour

    public function __invoke(Request $request): JsonResponse
    {
        $request->validate([
            'token' => ['required', 'string'],
        ]);

        $record = DB::table('password_reset_tokens')
            ->where('created_at', '>=', now()->subSeconds(self::TOKEN_EXPIRY_SECONDS))
            ->get()
            ->first(fn (object $row) => Hash::check($request->string('token')->value(), $row->token));

        if ($record === null) {
            return $this->success(['valid' => false]);
        }

        return $this->success([
            'valid' => true,
            'email' => $record->email,
        ]);
    }
}
