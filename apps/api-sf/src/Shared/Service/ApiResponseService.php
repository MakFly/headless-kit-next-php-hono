<?php

declare(strict_types=1);

namespace App\Shared\Service;

use Exception;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Contracts\Translation\TranslatorInterface;

final class ApiResponseService
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly RequestStack $requestStack,
    ) {
    }

    /**
     * @param array<string, mixed>|null $meta
     */
    public function success(mixed $data, int $status = 200, ?array $meta = null): JsonResponse
    {
        $payload = [
            'success' => true,
            'data' => $data,
            'status' => $status,
            'request_id' => $this->getRequestId(),
        ];

        if ($meta !== null) {
            $payload['meta'] = $meta;
        }

        return $this->buildResponse($payload, $status);
    }

    /**
     * @param array<string, mixed>|array<string, array<string>>|null $details
     */
    public function error(string $code, string $message, int $status, mixed $details = null): JsonResponse
    {
        $errorPayload = [
            'code' => $code,
            'message' => $this->translator->trans($message),
        ];

        if ($details !== null) {
            $errorPayload['details'] = $details;
        }

        $payload = [
            'success' => false,
            'error' => $errorPayload,
            'status' => $status,
            'request_id' => $this->getRequestId(),
        ];

        return $this->buildResponse($payload, $status);
    }

    public function paginated(mixed $data, int $page, int $perPage, int $total, int $status = 200): JsonResponse
    {
        $meta = [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];

        return $this->success($data, $status, $meta);
    }

    private function buildResponse(mixed $payload, int $status): JsonResponse
    {
        $response = new JsonResponse($payload, $status);
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('X-Request-Id', $this->getRequestId());

        return $response;
    }

    private function getRequestId(): string
    {
        static $requestId = null;

        if ($requestId !== null) {
            return $requestId;
        }

        $request = $this->requestStack->getCurrentRequest();
        $incoming = $request?->headers->get('X-Request-Id');
        if (\is_string($incoming) && $incoming !== '') {
            $requestId = $incoming;

            return $requestId;
        }

        try {
            $requestId = bin2hex(random_bytes(8));
        } catch (Exception) {
            $requestId = uniqid('req_', true);
        }

        return $requestId;
    }
}
