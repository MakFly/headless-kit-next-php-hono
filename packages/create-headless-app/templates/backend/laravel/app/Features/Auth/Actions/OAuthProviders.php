<?php

declare(strict_types=1);

namespace App\Features\Auth\Actions;

use App\Shared\Traits\ApiResponder;
use Illuminate\Http\JsonResponse;

class OAuthProviders
{
    use ApiResponder;

    protected array $providers = ['google', 'github'];

    public function __invoke(): JsonResponse
    {
        return $this->success($this->providers);
    }
}
