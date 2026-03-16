<?php

declare(strict_types=1);

namespace App\Features\Support\Actions;

use App\Features\Support\Formatters\CannedResponseFormatter;
use App\Shared\Models\CannedResponse;
use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class ListCannedResponses
{
    use ApiResponder;

    public function __invoke(): JsonResponse
    {
        $canned = CannedResponse::orderBy('category')->orderBy('title')->get();

        return $this->success($canned->map(fn ($c) => CannedResponseFormatter::format($c)));
    }
}
