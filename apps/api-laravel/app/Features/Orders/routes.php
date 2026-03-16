<?php

declare(strict_types=1);

use App\Features\Orders\Actions\CreateOrder;
use App\Features\Orders\Actions\ListOrders;
use App\Features\Orders\Actions\ShowOrder;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:betterauth')->group(function (): void {
    Route::post('/orders', CreateOrder::class);
    Route::get('/orders', ListOrders::class);
    Route::get('/orders/{id}', ShowOrder::class);
});
