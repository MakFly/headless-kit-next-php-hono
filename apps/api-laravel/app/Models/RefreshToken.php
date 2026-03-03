<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Support\Str;

class RefreshToken extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'user_id',
        'token',
        'expires_at',
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array<string, string>
     */
    protected $casts = [
        'expires_at' => 'datetime',
    ];

    /**
     * Token lifetime in days.
     */
    public const TOKEN_LIFETIME_DAYS = 30;

    /**
     * Get the user that owns the refresh token.
     */
    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    /**
     * Check if the token is expired.
     */
    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    /**
     * Check if the token is valid (not expired).
     */
    public function isValid(): bool
    {
        return !$this->isExpired();
    }

    /**
     * Generate a new random token string.
     *
     * @return string The raw token (to send to client)
     */
    public static function generateToken(): string
    {
        return Str::random(64);
    }

    /**
     * Hash a token for storage.
     *
     * @param string $token The raw token
     * @return string The hashed token
     */
    public static function hashToken(string $token): string
    {
        return hash('sha256', $token);
    }

    /**
     * Create a new refresh token for a user.
     *
     * @param User $user The user to create the token for
     * @return array{model: RefreshToken, token: string} The model and raw token
     */
    public static function createForUser(User $user): array
    {
        $rawToken = self::generateToken();
        $hashedToken = self::hashToken($rawToken);

        $model = self::create([
            'user_id' => $user->id,
            'token' => $hashedToken,
            'expires_at' => now()->addDays(self::TOKEN_LIFETIME_DAYS),
        ]);

        return [
            'model' => $model,
            'token' => $rawToken,
        ];
    }

    /**
     * Find a refresh token by its raw value.
     *
     * @param string $rawToken The raw token from the client
     * @return RefreshToken|null
     */
    public static function findByToken(string $rawToken): ?RefreshToken
    {
        $hashedToken = self::hashToken($rawToken);

        return self::where('token', $hashedToken)->first();
    }

    /**
     * Find a valid (non-expired) refresh token by its raw value.
     *
     * @param string $rawToken The raw token from the client
     * @return RefreshToken|null
     */
    public static function findValidByToken(string $rawToken): ?RefreshToken
    {
        $token = self::findByToken($rawToken);

        if ($token && $token->isValid()) {
            return $token;
        }

        return null;
    }

    /**
     * Revoke all refresh tokens for a user.
     *
     * @param int $userId The user ID
     * @return int Number of tokens revoked
     */
    public static function revokeAllForUser(int $userId): int
    {
        return self::where('user_id', $userId)->delete();
    }

    /**
     * Clean up expired tokens.
     *
     * @return int Number of tokens deleted
     */
    public static function cleanupExpired(): int
    {
        return self::where('expires_at', '<', now())->delete();
    }

    /**
     * Rotate a refresh token (delete old, create new).
     *
     * @param string $oldRawToken The old raw token to invalidate
     * @return array{model: RefreshToken, token: string}|null The new model and token, or null if old token invalid
     */
    public static function rotate(string $oldRawToken): ?array
    {
        $oldToken = self::findValidByToken($oldRawToken);

        if (!$oldToken) {
            return null;
        }

        $user = $oldToken->user;

        // Delete the old token
        $oldToken->delete();

        // Create a new token
        return self::createForUser($user);
    }
}
