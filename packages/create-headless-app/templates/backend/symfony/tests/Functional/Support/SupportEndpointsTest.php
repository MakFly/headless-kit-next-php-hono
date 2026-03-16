<?php

declare(strict_types=1);

namespace App\Tests\Functional\Support;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests for support endpoints — unauthenticated access tests (expect 401).
 * All support routes require authentication.
 */
class SupportEndpointsTest extends WebTestCase
{
    // =========================================================================
    // User — Conversations (401)
    // =========================================================================

    public function testListConversationsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/conversations');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testCreateConversationRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/support/conversations', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['subject' => 'Help', 'message' => 'I need help']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testGetConversationRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/conversations/fake-id');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testSendMessageRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/support/conversations/fake-id/messages', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['content' => 'Hello']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testRateConversationRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/support/conversations/fake-id/rate', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['rating' => 5]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Agent — Queue & Conversations (401)
    // =========================================================================

    public function testAgentQueueRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/agent/queue');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testAgentAssignedRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/agent/assigned');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testAssignConversationRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/support/agent/conversations/fake-id/assign');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateConversationStatusRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/support/agent/conversations/fake-id/status', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['status' => 'resolved']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Agent — Canned Responses (401)
    // =========================================================================

    public function testListCannedResponsesRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/agent/canned');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testCreateCannedResponseRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/support/agent/canned', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['title' => 'Test', 'content' => 'Test content']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateCannedResponseRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PUT', '/api/v1/support/agent/canned/fake-id', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['title' => 'Updated']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testDeleteCannedResponseRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/v1/support/agent/canned/fake-id');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Agent — Ratings (401)
    // =========================================================================

    public function testGetRatingStatsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/support/agent/ratings');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }
}
