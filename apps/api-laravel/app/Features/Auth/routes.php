<?php

declare(strict_types=1);

use App\Features\Auth\Actions\DeleteAccountAction;
use App\Features\Auth\Actions\ForgotPasswordAction;
use App\Features\Auth\Actions\OAuthProviders;
use App\Features\Auth\Actions\ResetPasswordAction;
use App\Features\Auth\Actions\TestAccounts;
use App\Features\Auth\Actions\UpdateProfileAction;
use App\Features\Auth\Actions\VerifyResetTokenAction;
use Illuminate\Support\Facades\Route;

Route::prefix('auth')->group(function (): void {
    // Public routes
    Route::post('/register', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'register']);
    Route::post('/login', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'login']);
    Route::post('/refresh', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'refresh']);
    Route::get('/test-accounts', TestAccounts::class);

    // Password reset routes (public, forgot is rate-limited)
    Route::post('/password/forgot', ForgotPasswordAction::class)->middleware('throttle:5,1');
    Route::post('/password/reset', ResetPasswordAction::class);
    Route::post('/password/verify-token', VerifyResetTokenAction::class);

    // Protected routes
    Route::middleware('auth:betterauth')->group(function (): void {
        Route::get('/me', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'me']);
        Route::patch('/me', UpdateProfileAction::class);
        Route::delete('/me', DeleteAccountAction::class);
        Route::post('/logout', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'logout']);
        Route::post('/revoke-all', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'revokeAll']);
        Route::put('/password', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'updatePassword']);
    });

    // Magic Link routes (activated via config/betterauth.php)
    Route::post('/magic-link', [\BetterAuth\Laravel\Http\Controllers\MagicLinkController::class, 'send']);
    Route::get('/magic-link/verify', [\BetterAuth\Laravel\Http\Controllers\MagicLinkController::class, 'verify']);
    Route::post('/magic-link/check', [\BetterAuth\Laravel\Http\Controllers\MagicLinkController::class, 'check']);

    // 2FA routes (activated via config/betterauth.php)
    Route::get('/2fa/status', [\BetterAuth\Laravel\Http\Controllers\TwoFactorController::class, 'status']);
    Route::post('/2fa/setup', [\BetterAuth\Laravel\Http\Controllers\TwoFactorController::class, 'setup']);
    Route::post('/2fa/verify', [\BetterAuth\Laravel\Http\Controllers\TwoFactorController::class, 'verify']);
    Route::post('/2fa/disable', [\BetterAuth\Laravel\Http\Controllers\TwoFactorController::class, 'disable']);

    // OAuth routes (activated via config/betterauth.php)
    Route::get('/oauth/{provider}', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'oauthRedirect']);
    Route::get('/oauth/{provider}/callback', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'oauthCallback']);
    Route::get('/oauth/providers', OAuthProviders::class);
});
