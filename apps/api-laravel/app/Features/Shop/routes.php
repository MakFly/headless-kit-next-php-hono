<?php

declare(strict_types=1);

use App\Features\Shop\Actions\ListCategories;
use App\Features\Shop\Actions\ListProducts;
use App\Features\Shop\Actions\ShowCategory;
use App\Features\Shop\Actions\ShowProduct;
use Illuminate\Support\Facades\Route;

// Shop - Public routes (no auth required)
Route::get('/products', ListProducts::class);
Route::get('/products/{slug}', ShowProduct::class);
Route::get('/categories', ListCategories::class);
Route::get('/categories/{slug}', ShowCategory::class);
