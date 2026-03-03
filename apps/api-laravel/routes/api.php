<?php

use App\Http\Controllers\Auth\OAuthController;
use Illuminate\Support\Facades\Route;

// =========================================================================
// BetterAuth Routes (gérées par le package)
// =========================================================================

Route::prefix('auth')->group(function () {
    // Public routes
    Route::post('/register', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'register']);
    Route::post('/login', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'login']);
    Route::post('/refresh', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'refresh']);

    // Protected routes
    Route::middleware('auth:betterauth')->group(function () {
        Route::get('/me', [\BetterAuth\Laravel\Http\Controllers\AuthController::class, 'me']);
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
    Route::get('/oauth/providers', [OAuthController::class, 'providers']);
});

// =========================================================================
// Public OAuth Routes (sans HMAC) - Pour OAuth providers externes
// =========================================================================

Route::prefix('auth')->group(function () {
    Route::get('/{provider}/redirect', [OAuthController::class, 'redirect']);
    Route::get('/{provider}/callback', [OAuthController::class, 'callback']);
});

// =========================================================================
// Versioned API Routes (AVEC HMAC) - Accès via BFF uniquement
// =========================================================================

Route::prefix('v1')
    ->middleware('bff.hmac')
    ->group(function () {

        // -------------------------------------------------------------------
        // Routes protégées (nécessitent auth:betterauth + HMAC)
        // -------------------------------------------------------------------
        Route::middleware('auth:betterauth')->group(function () {

            // Current User
            Route::get('/me', function (\Illuminate\Http\Request $request) {
                $user = $request->user();
                $user->load('roles.permissions');

                return response()->json([
                    'data' => [
                        'id' => $user->id,
                        'name' => $user->name,
                        'email' => $user->email,
                        'avatar' => $user->avatar ?? null,
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
                    ],
                ]);
            })->middleware('api.security');

            // Users list
            Route::get('/users', function () {
                return response()->json([
                    'data' => \App\Models\User::with('roles')->get(),
                ]);
            });

            // -------------------------------------------------------------------
            // Admin Routes (role: admin)
            // -------------------------------------------------------------------
            Route::middleware('role:admin')->prefix('admin')->group(function () {
                Route::get('/users', function () {
                    return response()->json([
                        'data' => \App\Models\User::with('roles')->paginate(15),
                    ]);
                });

                Route::get('/users/{user}', function (\App\Models\User $user) {
                    return response()->json([
                        'data' => $user->load('roles.permissions'),
                    ]);
                });

                Route::post('/users/{user}/roles', function (\App\Models\User $user, \Illuminate\Http\Request $request) {
                    $validated = $request->validate(['role' => 'required|string|exists:roles,slug']);
                    $user->assignRole($validated['role']);
                    return response()->json(['message' => 'Role assigned', 'data' => $user->load('roles')]);
                });

                Route::delete('/users/{user}/roles/{role}', function (\App\Models\User $user, \App\Models\Role $role) {
                    $user->removeRole($role);
                    return response()->json(['message' => 'Role removed']);
                });

                Route::get('/roles', function () {
                    return response()->json([
                        'data' => \App\Models\Role::with('permissions')->get(),
                    ]);
                });

                Route::post('/roles', function (\Illuminate\Http\Request $request) {
                    $validated = $request->validate([
                        'name' => 'required|string|max:255',
                        'slug' => 'required|string|max:255|unique:roles',
                        'description' => 'nullable|string',
                    ]);
                    $role = \App\Models\Role::create($validated);
                    return response()->json(['data' => $role], 201);
                });

                Route::get('/permissions', function () {
                    return response()->json([
                        'data' => \App\Models\Permission::all(),
                    ]);
                });

                Route::post('/roles/{role}/permissions', function (\App\Models\Role $role, \Illuminate\Http\Request $request) {
                    $validated = $request->validate(['permissions' => 'required|array']);
                    $role->permissions()->sync($validated['permissions']);
                    return response()->json(['message' => 'Permissions updated', 'data' => $role->load('permissions')]);
                });
            });

            // -------------------------------------------------------------------
            // Permission-based Routes Examples
            // -------------------------------------------------------------------
            Route::middleware('permission:posts.read')->get('/posts', function () {
                return response()->json(['message' => 'Posts list - you have posts.read permission']);
            });

            Route::middleware('permission:posts.create')->post('/posts', function () {
                return response()->json(['message' => 'Create post - you have posts.create permission']);
            });
        });
    });
