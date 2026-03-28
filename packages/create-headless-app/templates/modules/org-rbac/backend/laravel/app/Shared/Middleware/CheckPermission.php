<?php

declare(strict_types=1);

namespace App\Shared\Middleware;

use App\Shared\Helpers\ApiResponse;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckPermission
{
    public function handle(Request $request, Closure $next, string $permission): Response
    {
        if (! $request->user()) {
            return ApiResponse::error('UNAUTHORIZED', __('api.common.unauthenticated'), 401);
        }

        if (! $request->user()->hasPermission($permission)) {
            return ApiResponse::error('ACCESS_DENIED', __('api.common.insufficient_permissions'), 403);
        }

        return $next($request);
    }
}
