<?php

declare(strict_types=1);

use App\Features\Saas\Actions\CancelSubscription;
use App\Features\Saas\Actions\ChangeTeamRole;
use App\Features\Saas\Actions\CreateOrg;
use App\Features\Saas\Actions\Dashboard;
use App\Features\Saas\Actions\FlatCancelSubscription;
use App\Features\Saas\Actions\FlatChangeTeamRole;
use App\Features\Saas\Actions\FlatDashboard;
use App\Features\Saas\Actions\FlatGetSettings;
use App\Features\Saas\Actions\FlatGetSubscription;
use App\Features\Saas\Actions\FlatGetUsage;
use App\Features\Saas\Actions\FlatInviteTeamMember;
use App\Features\Saas\Actions\FlatListInvoices;
use App\Features\Saas\Actions\FlatListTeam;
use App\Features\Saas\Actions\FlatRemoveTeamMember;
use App\Features\Saas\Actions\FlatSubscribe;
use App\Features\Saas\Actions\FlatUpdateSettings;
use App\Features\Saas\Actions\GetSettings;
use App\Features\Saas\Actions\GetSubscription;
use App\Features\Saas\Actions\GetUsage;
use App\Features\Saas\Actions\InviteTeamMember;
use App\Features\Saas\Actions\ListInvoices;
use App\Features\Saas\Actions\ListOrgs;
use App\Features\Saas\Actions\ListPlans;
use App\Features\Saas\Actions\ListTeam;
use App\Features\Saas\Actions\RemoveTeamMember;
use App\Features\Saas\Actions\ShowOrg;
use App\Features\Saas\Actions\Subscribe;
use App\Features\Saas\Actions\UpdateSettings;
use Illuminate\Support\Facades\Route;

// Plans (public)
Route::get('/saas/plans', ListPlans::class);

// Flat routes (auto-resolve user's org, no orgId in URL)
Route::middleware('auth:betterauth')->prefix('saas')->group(function (): void {
    Route::post('/subscription', FlatSubscribe::class);
    Route::get('/subscription', FlatGetSubscription::class);
    Route::delete('/subscription', FlatCancelSubscription::class);
    Route::get('/invoices', FlatListInvoices::class);
    Route::get('/team', FlatListTeam::class);
    Route::post('/team/invite', FlatInviteTeamMember::class);
    Route::patch('/team/{id}/role', FlatChangeTeamRole::class);
    Route::delete('/team/{id}', FlatRemoveTeamMember::class);
    Route::get('/dashboard', FlatDashboard::class);
    Route::get('/usage', FlatGetUsage::class);
    Route::get('/settings', FlatGetSettings::class);
    Route::patch('/settings', FlatUpdateSettings::class);
});

// Org management + org-scoped routes
Route::middleware('auth:betterauth')->prefix('saas')->group(function (): void {
    Route::get('/orgs', ListOrgs::class);
    Route::post('/orgs', CreateOrg::class);

    Route::prefix('orgs/{orgId}')->group(function (): void {
        Route::middleware('org.rbac:viewer')->group(function (): void {
            Route::get('/', ShowOrg::class);
            Route::get('/dashboard', Dashboard::class);
        });

        Route::middleware('org.rbac:member')->group(function (): void {
            Route::get('/subscription', GetSubscription::class);
            Route::get('/team', ListTeam::class);
            Route::get('/usage', GetUsage::class);
        });

        Route::middleware('org.rbac:admin')->group(function (): void {
            Route::post('/team/invite', InviteTeamMember::class);
            Route::patch('/team/{id}/role', ChangeTeamRole::class);
            Route::delete('/team/{id}', RemoveTeamMember::class);
            Route::get('/invoices', ListInvoices::class);
            Route::get('/settings', GetSettings::class);
            Route::patch('/settings', UpdateSettings::class);
        });

        Route::middleware('org.rbac:owner')->group(function (): void {
            Route::post('/subscription', Subscribe::class);
            Route::delete('/subscription', CancelSubscription::class);
        });
    });
});
