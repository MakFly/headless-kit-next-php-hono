<?php

use App\Shared\Helpers\ApiResponse;
use App\Shared\Middleware\CheckPermission;
use App\Shared\Middleware\CheckRole;
use App\Shared\Middleware\ApiSecurityHeadersMiddleware;
use App\Shared\Middleware\SetLocaleMiddleware;
use Illuminate\Auth\AuthenticationException;
use Illuminate\Auth\Access\AuthorizationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        api: __DIR__.'/../routes/api.php',
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->alias([
            'role'         => CheckRole::class,
            'permission'   => CheckPermission::class,
            'api.security' => ApiSecurityHeadersMiddleware::class,
            'org.rbac'     => \App\Shared\Middleware\OrgRbacMiddleware::class,
        ]);

        $middleware->api(append: [
            SetLocaleMiddleware::class,
            ApiSecurityHeadersMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (\Throwable $e, Request $request) {
            if (! $request->is('api/*')) {
                return null;
            }

            if ($e instanceof ValidationException) {
                return ApiResponse::error(
                    'VALIDATION_ERROR',
                    __('api.common.validation_error'),
                    422,
                    $e->errors()
                );
            }

            if ($e instanceof AuthenticationException) {
                return ApiResponse::error(
                    'UNAUTHORIZED',
                    __('api.common.unauthenticated'),
                    401
                );
            }

            if ($e instanceof ModelNotFoundException) {
                return ApiResponse::error(
                    'NOT_FOUND',
                    __('api.common.not_found'),
                    404
                );
            }

            if ($e instanceof AuthorizationException) {
                return ApiResponse::error(
                    'ACCESS_DENIED',
                    __('api.common.forbidden'),
                    403
                );
            }

            if ($e instanceof NotFoundHttpException) {
                return ApiResponse::error(
                    'NOT_FOUND',
                    __('api.common.not_found'),
                    404
                );
            }

            return ApiResponse::error(
                'INTERNAL_ERROR',
                __('api.common.internal_error'),
                500
            );
        });
    })->create();
