<?php

declare(strict_types=1);

use App\Features\Users\Actions\ListUsers;
use App\Features\Users\Actions\Me;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:betterauth')->group(function (): void {
    Route::get('/me', Me::class)->middleware('api.security');
    Route::get('/users', ListUsers::class);
});
