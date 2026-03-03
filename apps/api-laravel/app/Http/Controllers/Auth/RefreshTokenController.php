<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Models\RefreshToken;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;

class RefreshTokenController extends Controller
{
    /**
     * Refresh access token using refresh token.
     *
     * This endpoint:
     * 1. Validates the refresh token from request body
     * 2. Rotates the refresh token (invalidates old, creates new)
     * 3. Creates a new access token
     * 4. Returns both tokens
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function refresh(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'refresh_token' => 'required|string|min:32',
        ]);

        $rawRefreshToken = $validated['refresh_token'];

        // Find and validate the refresh token
        $refreshToken = RefreshToken::findValidByToken($rawRefreshToken);

        if (!$refreshToken) {
            throw ValidationException::withMessages([
                'refresh_token' => ['The refresh token is invalid or expired.'],
            ]);
        }

        // Get the user
        $user = $refreshToken->user;

        if (!$user) {
            // Cleanup orphaned token
            $refreshToken->delete();

            throw ValidationException::withMessages([
                'refresh_token' => ['User not found.'],
            ]);
        }

        // Rotate the refresh token (invalidate old, create new)
        $newRefreshTokenData = RefreshToken::rotate($rawRefreshToken);

        if (!$newRefreshTokenData) {
            throw ValidationException::withMessages([
                'refresh_token' => ['Failed to rotate refresh token.'],
            ]);
        }

        // Revoke old access tokens and create new one
        // Note: In Laravel Passport, we revoke the current token and create a new one
        $user->tokens()->where('revoked', false)->update(['revoked' => true]);

        $accessToken = $user->createToken('auth_token')->accessToken;

        return response()->json([
            'data' => [
                'user' => $this->formatUser($user),
                'access_token' => $accessToken,
                'refresh_token' => $newRefreshTokenData['token'],
                'token_type' => 'Bearer',
                'expires_in' => config('passport.token_lifetime', 60) * 60, // Convert minutes to seconds
            ],
            'message' => 'Token refreshed successfully',
        ]);
    }

    /**
     * Revoke all refresh tokens for the authenticated user.
     *
     * @param Request $request
     * @return JsonResponse
     */
    public function revokeAll(Request $request): JsonResponse
    {
        $user = $request->user();

        if (!$user) {
            return response()->json([
                'error' => 'Unauthenticated',
            ], 401);
        }

        $count = RefreshToken::revokeAllForUser($user->id);

        return response()->json([
            'message' => 'All refresh tokens revoked',
            'revoked_count' => $count,
        ]);
    }

    /**
     * Format user data for response.
     *
     * @param User $user
     * @return array
     */
    private function formatUser(User $user): array
    {
        $user->load('roles.permissions');

        return [
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'created_at' => $user->created_at,
            'updated_at' => $user->updated_at,
            'roles' => $user->roles->map(fn($role) => [
                'id' => $role->id,
                'name' => $role->name,
                'slug' => $role->slug,
            ]),
            'permissions' => $user->getAllPermissions()->map(fn($perm) => [
                'id' => $perm->id,
                'name' => $perm->name,
                'slug' => $perm->slug,
                'resource' => $perm->resource,
                'action' => $perm->action,
            ])->values(),
        ];
    }
}
