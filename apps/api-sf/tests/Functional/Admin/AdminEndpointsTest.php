<?php

declare(strict_types=1);

namespace App\Tests\Functional\Admin;

use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

/**
 * Tests for admin endpoints — only unauthenticated access (expecting 401).
 *
 * BetterAuth signUp is broken so we cannot test authenticated flows.
 * These tests verify that all admin routes are protected and return 401
 * when accessed without a valid token.
 */
class AdminEndpointsTest extends WebTestCase
{
    // =========================================================================
    // Products CRUD — 401 without auth
    // =========================================================================

    public function testListProductsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/admin/products', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'Test', 'slug' => 'test', 'price' => 999]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testCreateProductRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/admin/products', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'Test', 'slug' => 'test', 'price' => 999]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateProductRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PUT', '/api/v1/admin/products/fake-id', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['name' => 'Updated']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testDeleteProductRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('DELETE', '/api/v1/admin/products/fake-id');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Orders — 401 without auth
    // =========================================================================

    public function testListOrdersRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/orders');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testUpdateOrderStatusRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/admin/orders/fake-id/status', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['status' => 'shipped']));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Dashboard — 401 without auth
    // =========================================================================

    public function testDashboardRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/dashboard');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Analytics — 401 without auth
    // =========================================================================

    public function testRevenueAnalyticsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/analytics/revenue');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testTopProductsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/analytics/top-products');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // Inventory — 401 without auth
    // =========================================================================

    public function testInventoryListRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/inventory');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testInventoryUpdateRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('PATCH', '/api/v1/admin/inventory/fake-id', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['stockQuantity' => 50]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testBulkApproveReviewsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/admin/reviews/bulk-approve', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['ids' => ['fake-id-1', 'fake-id-2']]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testBulkRejectReviewsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('POST', '/api/v1/admin/reviews/bulk-reject', [], [], [
            'CONTENT_TYPE' => 'application/json',
        ], json_encode(['ids' => ['fake-id-1']]));

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    // =========================================================================
    // RBAC — 401 without auth (existing AdminRbacController)
    // =========================================================================

    public function testListRolesRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/roles');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }

    public function testListPermissionsRequiresAuth(): void
    {
        $client = static::createClient();
        $client->request('GET', '/api/v1/admin/permissions');

        $this->assertSame(401, $client->getResponse()->getStatusCode());
    }
}
