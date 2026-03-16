<?php

declare(strict_types=1);

namespace App\Tests\Functional\Saas;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests for SaaS endpoints — unauthenticated access tests.
 *
 * Plan route is public (expect 200).
 * All other routes require authentication (expect 401).
 */
class SaasEndpointsTest extends WebTestCase
{
    private const FAKE_ORG = 'fake-org-id';

    // =========================================================================
    // Plans (public) — should return 200
    // =========================================================================

    public function testListPlansIsPublic(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/plans');

        $this->assertSame(200, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Dashboard — 401 without auth
    // =========================================================================

    public function testDashboardRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/dashboard');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Subscription — 401 without auth
    // =========================================================================

    public function testGetSubscriptionRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/subscription');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testCreateSubscriptionRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/subscription', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['planId' => 'fake-plan']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testCancelSubscriptionRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/subscription');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Invoices — 401 without auth
    // =========================================================================

    public function testListInvoicesRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/invoices');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Team — 401 without auth
    // =========================================================================

    public function testListTeamRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/team');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testInviteMemberRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/team/invite', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['email' => 'test@example.com', 'role' => 'member']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateMemberRoleRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/team/fake-id/role', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['role' => 'admin']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testRemoveMemberRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/team/fake-id');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Usage — 401 without auth
    // =========================================================================

    public function testGetUsageRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/usage');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Settings — 401 without auth
    // =========================================================================

    public function testGetSettingsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/settings');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateSettingsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/saas/orgs/' . self::FAKE_ORG . '/settings', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'Updated']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }
}
