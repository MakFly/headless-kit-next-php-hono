<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Models\User;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class DeleteAccountAction
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        /** @var User $user */
        $user = $request->user();

        DB::transaction(function () use ($user): void {
            // Revoke all BetterAuth tokens
            DB::table('sessions')->where('user_id', $user->id)->delete();
            DB::table('refresh_tokens')->where('user_id', $user->id)->delete();

            // Delete the user (cascades in DB, but also explicit cleanup)
            $user->delete();
        });

        return $this->success(['message' => 'Account deleted successfully']);
    }
}
