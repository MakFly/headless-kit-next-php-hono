<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\Serializer;

use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\HttpKernel\Event\ResponseEvent;
use Symfony\Component\HttpKernel\KernelEvents;

final class ApiPlatformEnvelopeSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly RequestStack $requestStack,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::RESPONSE => ['onKernelResponse', -64],
        ];
    }

    public function onKernelResponse(ResponseEvent $event): void
    {
        if (!$event->isMainRequest()) {
            return;
        }

        $request = $event->getRequest();

        // Only process API Platform responses
        if (!$request->attributes->get('_api_resource_class')) {
            return;
        }

        $response = $event->getResponse();
        $contentType = $response->headers->get('Content-Type', '');

        if (!str_contains($contentType, 'json')) {
            return;
        }

        $content = $response->getContent();
        if ($content === false || $content === '') {
            return;
        }

        $decoded = json_decode($content, true);
        if (!is_array($decoded)) {
            return;
        }

        $status = $response->getStatusCode();
        $requestId = $this->getRequestId();

        if ($status >= 400) {
            $envelope = [
                'success' => false,
                'error' => [
                    'code' => $this->mapStatusToCode($status),
                    'message' => $decoded['detail'] ?? $decoded['message'] ?? 'An error occurred',
                ],
                'status' => $status,
                'request_id' => $requestId,
            ];

            if (isset($decoded['violations'])) {
                $envelope['error']['details'] = $decoded['violations'];
            }
        } elseif ($this->isCollection($decoded)) {
            // JSON-LD: {"member": [...], "totalItems": N}
            // Plain JSON: [...] (numerically-indexed array)
            $items = $decoded['member'] ?? (array_is_list($decoded) ? $decoded : []);
            $envelope = [
                'success' => true,
                'data' => $items,
                'meta' => $this->extractPaginationMeta($decoded, count($items)),
                'status' => $status,
                'request_id' => $requestId,
            ];
        } else {
            $envelope = [
                'success' => true,
                'data' => $decoded,
                'status' => $status,
                'request_id' => $requestId,
            ];
        }

        $response->setContent(json_encode($envelope, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE));
        $response->headers->set('Content-Type', 'application/json');
        $response->headers->set('Cache-Control', 'no-store, no-cache, must-revalidate, max-age=0');
        $response->headers->set('Pragma', 'no-cache');
        $response->headers->set('X-Request-Id', $requestId);
    }

    private function isCollection(array $data): bool
    {
        // JSON-LD format: {"member": [...], "totalItems": N}
        if (isset($data['member']) || isset($data['totalItems'])) {
            return true;
        }

        // Plain JSON format: API Platform returns a numerically-indexed array for collections
        return array_is_list($data);
    }

    /**
     * @return array{page: int, per_page: int, total: int, last_page: int}
     */
    private function extractPaginationMeta(array $data, int $itemCount = 0): array
    {
        // JSON-LD format provides totalItems; plain JSON does not
        $total = $data['totalItems'] ?? $itemCount;
        $request = $this->requestStack->getCurrentRequest();
        $page = max(1, (int) ($request?->query->get('page', 1) ?? 1));
        $perPage = max(1, (int) ($request?->query->get('itemsPerPage', 20) ?? 20));

        return [
            'page' => $page,
            'per_page' => $perPage,
            'total' => $total,
            'last_page' => max(1, (int) ceil($total / $perPage)),
        ];
    }

    private function mapStatusToCode(int $status): string
    {
        return match ($status) {
            400 => 'BAD_REQUEST',
            401 => 'UNAUTHORIZED',
            403 => 'ACCESS_DENIED',
            404 => 'NOT_FOUND',
            405 => 'METHOD_NOT_ALLOWED',
            422 => 'VALIDATION_ERROR',
            429 => 'TOO_MANY_REQUESTS',
            default => 'HTTP_ERROR',
        };
    }

    private function getRequestId(): string
    {
        $request = $this->requestStack->getCurrentRequest();
        $incoming = $request?->headers->get('X-Request-Id');

        if (is_string($incoming) && $incoming !== '') {
            return $incoming;
        }

        try {
            return bin2hex(random_bytes(8));
        } catch (\Exception) {
            return uniqid('req_', true);
        }
    }
}
