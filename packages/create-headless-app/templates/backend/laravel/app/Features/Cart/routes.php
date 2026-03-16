<?php

declare(strict_types=1);

use App\Features\Cart\Actions\AddItem;
use App\Features\Cart\Actions\RemoveItem;
use App\Features\Cart\Actions\ShowCart;
use App\Features\Cart\Actions\UpdateItem;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:betterauth')->group(function (): void {
    Route::get('/cart', ShowCart::class);
    Route::post('/cart/items', AddItem::class);
    Route::patch('/cart/items/{id}', UpdateItem::class);
    Route::delete('/cart/items/{id}', RemoveItem::class);
});
