<?php

use Illuminate\Support\Facades\Route;

// =========================================================================
// Auth Routes (BetterAuth + OAuth providers)
// =========================================================================
require app_path('Features/Auth/routes.php');

// =========================================================================
// Versioned API Routes - Accès via BFF uniquement
// =========================================================================
Route::prefix('v1')->group(function (): void {
    require app_path('Features/Shop/routes.php');
    require app_path('Features/Cart/routes.php');
    require app_path('Features/Orders/routes.php');
    require app_path('Features/Users/routes.php');
    require app_path('Features/Admin/routes.php');
    require app_path('Features/Saas/routes.php');
    require app_path('Features/Support/routes.php');
});
