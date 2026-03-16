<?php

declare(strict_types=1);

namespace App\Shared\Traits;

use App\Shared\Helpers\ApiResponse;
use Illuminate\Http\JsonResponse;

trait ApiResponder
{
    protected function success(mixed $data, int $status = 200, ?array $meta = null): JsonResponse
    {
        return ApiResponse::success($data, $status, $meta);
    }

    protected function error(string $code, string $message, int $status, mixed $details = null): JsonResponse
    {
        return ApiResponse::error($code, $message, $status, $details);
    }

    protected function paginated(mixed $data, int $page, int $perPage, int $total, int $status = 200): JsonResponse
    {
        return ApiResponse::paginated($data, $page, $perPage, $total, $status);
    }

    protected function created(mixed $data): JsonResponse
    {
        return ApiResponse::created($data);
    }

    protected function deleted(?string $message = null): JsonResponse
    {
        return ApiResponse::deleted($message);
    }
}
