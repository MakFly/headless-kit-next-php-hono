<?php

namespace App\Http\Middleware;

use App\Helpers\HmacValidator;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

/**
 * Middleware de protection BFF
 *
 * Vérifie que toutes les requêtes vers les routes versionnées (/api/v1/*)
 * sont signées avec HMAC par le BFF Next.js
 */
class BffHmacMiddleware
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next)
    {
        // Valider la signature HMAC
        $validation = HmacValidator::validate($request);

        if (!$validation['valid']) {
            $requestId = $request->header('X-Request-Id') ?: (string) Str::uuid();
            Log::warning('BFF authentication failed', [
                'error' => $validation['error'],
                'path' => $request->path(),
                'ip' => $request->ip(),
                'request_id' => $requestId,
            ]);

            return $this->errorResponse($validation['error'], $requestId);
        }

        return $next($request);
    }

    /**
     * Génère une réponse d'erreur JSON
     */
    private function errorResponse(string $message, string $requestId): JsonResponse
    {
        $response = response()->json([
            'error' => $message,
            'message' => 'BFF authentication failed',
            'code' => 'BFF_AUTH_FAILED',
            'status' => 403,
            'request_id' => $requestId,
        ], 403);

        $response->headers->set('X-Request-Id', $requestId);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');

        return $response;
    }
}
