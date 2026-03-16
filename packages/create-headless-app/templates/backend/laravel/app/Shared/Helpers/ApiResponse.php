<?php

declare(strict_types=1);

namespace App\Shared\Helpers;

use Illuminate\Http\JsonResponse;

class ApiResponse
{
    public static function success(mixed $data, int $status = 200, ?array $meta = null): JsonResponse
    {
        $payload = [
            'success'    => true,
            'data'       => $data,
            'status'     => $status,
            'request_id' => bin2hex(random_bytes(8)),
        ];

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        return response()->json($payload, $status)->withHeaders([
            'Cache-Control' => 'no-store',
        ]);
    }

    public static function error(string $code, string $message, int $status, mixed $details = null): JsonResponse
    {
        $error = [
            'code'    => $code,
            'message' => $message,
        ];

        if ($details !== null) {
            $error['details'] = $details;
        }

        return response()->json([
            'success'    => false,
            'error'      => $error,
            'status'     => $status,
            'request_id' => bin2hex(random_bytes(8)),
        ], $status)->withHeaders([
            'Cache-Control' => 'no-store',
        ]);
    }

    public static function paginated(mixed $data, int $page, int $perPage, int $total, int $status = 200): JsonResponse
    {
        $payload = [
            'success'    => true,
            'data'       => $data,
            'pagination' => [
                'page'       => $page,
                'perPage'    => $perPage,
                'total'      => $total,
                'totalPages' => (int) ceil($total / max(1, $perPage)),
            ],
            'status'     => $status,
            'request_id' => bin2hex(random_bytes(8)),
        ];

        return response()->json($payload, $status)->withHeaders([
            'Cache-Control' => 'no-store',
        ]);
    }

    public static function created(mixed $data): JsonResponse
    {
        return self::success($data, 201);
    }

    public static function deleted(?string $message = null): JsonResponse
    {
        return self::success([
            'message' => $message ?? __('api.common.deleted'),
        ], 200);
    }
}
