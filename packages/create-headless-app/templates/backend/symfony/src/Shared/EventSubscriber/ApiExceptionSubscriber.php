<?php

declare(strict_types=1);

namespace App\Shared\EventSubscriber;

use App\Shared\Service\ApiResponseService;
use Symfony\Component\EventDispatcher\EventSubscriberInterface;
use Symfony\Component\HttpKernel\Event\ExceptionEvent;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Component\HttpKernel\Exception\NotFoundHttpException;
use Symfony\Component\HttpKernel\KernelEvents;
use Symfony\Component\Security\Core\Exception\AccessDeniedException;

final class ApiExceptionSubscriber implements EventSubscriberInterface
{
    public function __construct(
        private readonly ApiResponseService $api,
    ) {
    }

    public static function getSubscribedEvents(): array
    {
        return [
            KernelEvents::EXCEPTION => ['onKernelException', 0],
        ];
    }

    public function onKernelException(ExceptionEvent $event): void
    {
        $request = $event->getRequest();

        if (!str_starts_with($request->getPathInfo(), '/api/')) {
            return;
        }

        $throwable = $event->getThrowable();

        [$status, $code, $message] = $this->mapException($throwable);

        $event->setResponse($this->api->error($code, $message, $status));
    }

    /**
     * @return array{int, string, string}
     */
    private function mapException(\Throwable $throwable): array
    {
        if ($throwable instanceof AccessDeniedException) {
            return [403, 'ACCESS_DENIED', 'common.access_denied'];
        }

        if ($throwable instanceof NotFoundHttpException) {
            return [404, 'NOT_FOUND', 'common.not_found'];
        }

        if ($throwable instanceof HttpException) {
            $status = $throwable->getStatusCode();
            $code = match ($status) {
                400 => 'BAD_REQUEST',
                401 => 'UNAUTHORIZED',
                403 => 'ACCESS_DENIED',
                404 => 'NOT_FOUND',
                405 => 'METHOD_NOT_ALLOWED',
                422 => 'VALIDATION_ERROR',
                429 => 'TOO_MANY_REQUESTS',
                default => 'HTTP_ERROR',
            };

            return [$status, $code, $throwable->getMessage() ?: 'common.' . strtolower($code)];
        }

        if ($throwable instanceof \InvalidArgumentException) {
            return [400, 'BAD_REQUEST', $throwable->getMessage() ?: 'common.bad_request'];
        }

        return [500, 'INTERNAL_ERROR', 'common.internal_error'];
    }
}
