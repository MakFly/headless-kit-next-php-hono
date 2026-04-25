<?php

declare(strict_types=1);

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'message' => 'API OK',
        'version' => '1.0.0',
        'framework' => 'Laravel',
    ]);
});

Route::get('/health', function () {
    $db = 'ok';
    try {
        \Illuminate\Support\Facades\DB::connection()->getPdo();
    } catch (\Throwable $e) {
        $db = 'down';
    }

    $status = $db === 'ok' ? 200 : 503;

    return response()->json([
        'success' => $status === 200,
        'data' => [
            'status' => $status === 200 ? 'ok' : 'degraded',
            'service' => 'api-laravel',
            'db' => $db,
        ],
        'status' => $status,
    ], $status);
});
