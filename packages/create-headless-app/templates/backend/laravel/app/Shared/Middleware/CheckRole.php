<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use App\Shared\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    public function handle(Request $request, Closure $next, string ...$roles): Response
    {
        if (! $request->user()) {
            return ApiResponse::error('UNAUTHORIZED', __('api.common.unauthenticated'), 401);
        }

        if (! $request->user()->hasAnyRole($roles)) {
            return ApiResponse::error('ACCESS_DENIED', __('api.common.role_not_authorized'), 403);
        }

        return $next($request);
    }
}
