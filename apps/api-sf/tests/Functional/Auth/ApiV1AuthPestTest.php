<?php

declare(strict_types=1);

use Symfony\Bundle\FrameworkBundle\KernelBrowser;
use Symfony\Component\HttpFoundation\Response;

function resetAuthTables(KernelBrowser $client): void
{
    $container = $client->getContainer();
    $em = $container->get('doctrine')->getManager();
    $cache = $container->get('cache.app');
    $connection = $em->getConnection();

    $connection->executeStatement('DELETE FROM refresh_tokens');
    $connection->executeStatement('DELETE FROM sessions');
    $connection->executeStatement('DELETE FROM users');
    $cache->clear();
}

function requestJson(
    KernelBrowser $client,
    string $method,
    string $uri,
    ?array $payload = null,
    array $server = []
): void {
    $headers = array_merge(['CONTENT_TYPE' => 'application/json'], $server);
    $content = $payload === null ? null : json_encode($payload, JSON_THROW_ON_ERROR);

    $client->request($method, $uri, [], [], $headers, $content);
}

function decodeResponse(string $content): array
{
    return json_decode($content, true, 512, JSON_THROW_ON_ERROR);
}

it('returns no-store headers and request metadata when registering a user', function () {
    $client = static::createClient();
    resetAuthTables($client);

    requestJson($client, 'POST', '/api/v1/auth/register', [
        'email' => 'pest-register@example.com',
        'password' => 'SecurePassword123!',
        'name' => 'Pest Register User',
    ]);

    $response = $client->getResponse();
    $requestId = $response->headers->get('X-Request-Id');
    $payload = decodeResponse($response->getContent());

    expect($response->getStatusCode())->toBe(Response::HTTP_CREATED)
        ->and($response->headers->get('Cache-Control'))->toContain('no-store')
        ->and(strtolower((string) $response->headers->get('Pragma')))->toBe('no-cache')
        ->and($requestId)->not->toBe('')
        ->and($payload)->toHaveKeys(['status', 'request_id', 'user', 'access_token', 'refresh_token'])
        ->and($payload['status'])->toBe(Response::HTTP_CREATED)
        ->and($payload['request_id'])->toBe($requestId);
});

it('returns structured bad-request response with request metadata on /login without credentials', function () {
    $client = static::createClient();
    resetAuthTables($client);

    requestJson($client, 'POST', '/api/v1/auth/login', []);

    $response = $client->getResponse();
    $requestId = $response->headers->get('X-Request-Id');
    $payload = decodeResponse($response->getContent());

    expect($response->getStatusCode())->toBe(Response::HTTP_BAD_REQUEST)
        ->and($response->headers->get('Cache-Control'))->toContain('no-store')
        ->and(strtolower((string) $response->headers->get('Pragma')))->toBe('no-cache')
        ->and($requestId)->not->toBe('')
        ->and($payload)->toHaveKeys(['error', 'status', 'request_id'])
        ->and($payload['error'])->toBe('Email and password are required')
        ->and($payload['status'])->toBe(Response::HTTP_BAD_REQUEST)
        ->and($payload['request_id'])->toBe($requestId);
});
