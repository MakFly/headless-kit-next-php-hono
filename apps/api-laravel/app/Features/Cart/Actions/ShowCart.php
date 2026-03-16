<?php

declare(strict_types=1);

namespace App\Features\Cart\Actions;

use App\Features\Cart\Formatters\CartFormatter;
use App\Shared\Models\Cart;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShowCart
{
    use ApiResponder;

    public function __invoke(Request $request): JsonResponse
    {
        $cart = Cart::firstOrCreate(['user_id' => $request->user()->id]);

        return $this->success(CartFormatter::format($cart));
    }
}
