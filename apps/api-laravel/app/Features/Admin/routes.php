<?php

declare(strict_types=1);

use App\Features\Admin\Actions\AdminCreateProduct;
use App\Features\Admin\Actions\AdminDeleteProduct;
use App\Features\Admin\Actions\AdminListOrders;
use App\Features\Admin\Actions\AdminListProducts;
use App\Features\Admin\Actions\AdminUpdateOrderStatus;
use App\Features\Admin\Actions\AdminUpdateProduct;
use App\Features\Admin\Actions\AssignRole;
use App\Features\Admin\Actions\BulkApproveReviews;
use App\Features\Admin\Actions\BulkRejectReviews;
use App\Features\Admin\Actions\CreateCustomer;
use App\Features\Admin\Actions\CreateRole;
use App\Features\Admin\Actions\Dashboard;
use App\Features\Admin\Actions\DeleteCustomer;
use App\Features\Admin\Actions\Inventory;
use App\Features\Admin\Actions\ListCustomers;
use App\Features\Admin\Actions\ListPermissions;
use App\Features\Admin\Actions\ListReviews;
use App\Features\Admin\Actions\ListRoles;
use App\Features\Admin\Actions\ListSegments;
use App\Features\Admin\Actions\ListUsers;
use App\Features\Admin\Actions\RemoveRole;
use App\Features\Admin\Actions\RevenueAnalytics;
use App\Features\Admin\Actions\ShowCustomer;
use App\Features\Admin\Actions\ShowReview;
use App\Features\Admin\Actions\ShowUser;
use App\Features\Admin\Actions\SyncPermissions;
use App\Features\Admin\Actions\TopProducts;
use App\Features\Admin\Actions\UpdateCustomer;
use App\Features\Admin\Actions\UpdateInventory;
use App\Features\Admin\Actions\UpdateReview;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth:betterauth', 'role:admin'])->prefix('admin')->group(function (): void {
    // RBAC
    Route::get('/users', ListUsers::class);
    Route::get('/users/{user}', ShowUser::class);
    Route::post('/users/{user}/roles', AssignRole::class);
    Route::delete('/users/{user}/roles/{role}', RemoveRole::class);
    Route::get('/roles', ListRoles::class);
    Route::post('/roles', CreateRole::class);
    Route::get('/permissions', ListPermissions::class);
    Route::post('/roles/{role}/permissions', SyncPermissions::class);

    // Shop Admin — Products
    Route::get('/products', AdminListProducts::class);
    Route::post('/products', AdminCreateProduct::class);
    Route::put('/products/{id}', AdminUpdateProduct::class);
    Route::delete('/products/{id}', AdminDeleteProduct::class);

    // Shop Admin — Orders
    Route::get('/orders', AdminListOrders::class);
    Route::patch('/orders/{id}/status', AdminUpdateOrderStatus::class);

    // Shop Admin — Dashboard & Analytics
    Route::get('/dashboard', Dashboard::class);
    Route::get('/analytics/revenue', RevenueAnalytics::class);
    Route::get('/analytics/top-products', TopProducts::class);

    // Shop Admin — Inventory
    Route::get('/inventory', Inventory::class);
    Route::patch('/inventory/{productId}', UpdateInventory::class);

    // Shop Admin — Customers
    Route::get('/customers', ListCustomers::class);
    Route::post('/customers', CreateCustomer::class);
    Route::get('/customers/{id}', ShowCustomer::class);
    Route::put('/customers/{id}', UpdateCustomer::class);
    Route::delete('/customers/{id}', DeleteCustomer::class);

    // Shop Admin — Reviews
    Route::get('/reviews', ListReviews::class);
    Route::get('/reviews/{id}', ShowReview::class);
    Route::put('/reviews/{id}', UpdateReview::class);
    Route::post('/reviews/bulk-approve', BulkApproveReviews::class);
    Route::post('/reviews/bulk-reject', BulkRejectReviews::class);

    // Shop Admin — Segments
    Route::get('/segments', ListSegments::class);
});
