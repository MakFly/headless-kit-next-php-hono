/**
 * Integration tests for SaaS endpoints
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { createMiddleware } from 'hono/factory';
import * as saasHandler from '../../../features/saas/saas.handlers.ts';
import { seedSaas } from '../../../shared/db/seeders/saas.seed.ts';
import { seedShop } from '../../../shared/db/seeders/shop.seed.ts';
import { db, schema } from '../../../shared/db/index.ts';
import { eq } from 'drizzle-orm';
import type { AppVariables } from '../../../shared/types/index.ts';
import { createTestApp } from '../../helpers/test-app.ts';

const ADMIN_USER_ID = 'admin-00000000-0000-0000-0000-000000000001';
const TEST_USER_ID = 'user-00000000-0000-0000-0000-000000000002';
const OTHER_USER_ID = 'user-00000000-0000-0000-0000-000000000003';

function buildSaasApp(userId: string, email: string, orgSlug: string | null = null) {
  const fakeAuth = createMiddleware<{ Variables: AppVariables }>(async (c, next) => {
    c.set('user', {
      id: userId,
      email,
      name: 'Test User',
      emailVerifiedAt: null,
      avatarUrl: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
    c.set('jwtPayload', null);
    c.set('requestId', 'test-request-id');

    // Set org context if orgSlug provided
    if (orgSlug) {
      const org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.slug, orgSlug),
      });
      c.set('org', org ?? null);
    } else {
      c.set('org', null);
    }

    await next();
  });

  const app = createTestApp();
  app.use('*', fakeAuth);

  app.get('/api/v1/saas/plans', (c) => saasHandler.listPlans(c));
  app.get('/api/v1/saas/dashboard', (c) => saasHandler.getDashboard(c));
  app.get('/api/v1/saas/subscription', (c) => saasHandler.getSubscription(c));
  app.post('/api/v1/saas/subscription', (c) => saasHandler.subscribe(c));
  app.delete('/api/v1/saas/subscription', (c) => saasHandler.cancelSubscription(c));
  app.get('/api/v1/saas/invoices', (c) => saasHandler.listInvoices(c));
  app.get('/api/v1/saas/team', (c) => saasHandler.listTeamMembers(c));
  app.post('/api/v1/saas/team/invite', (c) => saasHandler.inviteTeamMember(c));
  app.patch('/api/v1/saas/team/:id/role', (c) => saasHandler.updateTeamMemberRole(c));
  app.delete('/api/v1/saas/team/:id', (c) => saasHandler.removeTeamMember(c));
  app.get('/api/v1/saas/usage', (c) => saasHandler.getUsage(c));
  app.get('/api/v1/saas/settings', (c) => saasHandler.getSettings(c));
  app.patch('/api/v1/saas/settings', (c) => saasHandler.updateSettings(c));

  return app;
}

// adminApp → uses 'acme-corp' org (owned by ADMIN_USER_ID)
const adminApp = buildSaasApp(ADMIN_USER_ID, 'admin@example.com', 'acme-corp');
// testApp → uses 'dev-team' org (owned by TEST_USER_ID)
const testApp = buildSaasApp(TEST_USER_ID, 'test@test.com', 'dev-team');

beforeAll(async () => {
  await seedShop();
  await seedSaas();
});

describe('SaaS Endpoints', () => {
  // =====================================================================
  // Plans
  // =====================================================================
  describe('Plans', () => {
    it('GET /plans - should list all plans', async () => {
      const res = await adminApp.request('/api/v1/saas/plans');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBe(4);

      const names = body.data.map((p: { name: string }) => p.name);
      expect(names).toContain('Free');
      expect(names).toContain('Starter');
      expect(names).toContain('Pro');
      expect(names).toContain('Enterprise');
    });
  });

  // =====================================================================
  // Dashboard
  // =====================================================================
  describe('Dashboard', () => {
    it('GET /dashboard - should return dashboard stats', async () => {
      const res = await adminApp.request('/api/v1/saas/dashboard');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.activeMembers).toBeGreaterThanOrEqual(1);
      expect(body.data.currentPlan).toBe('Starter');
      expect(body.data).toHaveProperty('totalProjects');
      expect(body.data).toHaveProperty('apiCallsThisMonth');
      expect(body.data).toHaveProperty('storageUsed');
    });
  });

  // =====================================================================
  // Subscription (read then mutate)
  // =====================================================================
  describe('Subscription', () => {
    it('GET /subscription - should return active subscription', async () => {
      const res = await adminApp.request('/api/v1/saas/subscription');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('active');
      expect(body.data.planName).toBe('Starter');
    });

    it('POST /subscription - should reject already subscribed (409)', async () => {
      const plan = await db.query.plans.findFirst({
        where: eq(schema.plans.slug, 'pro'),
      });

      const res = await adminApp.request('/api/v1/saas/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan!.id }),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ALREADY_SUBSCRIBED');
    });

    it('DELETE /subscription - should cancel subscription', async () => {
      // Cancel testUser's sub (Dev Team)
      const res = await testApp.request('/api/v1/saas/subscription', {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('cancelled');
    });

    it('DELETE /subscription - should return 404 when no active sub', async () => {
      // testUser's sub was just cancelled above
      const res = await testApp.request('/api/v1/saas/subscription', {
        method: 'DELETE',
      });

      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('NO_SUBSCRIPTION');
    });

    it('POST /subscription - should re-subscribe after cancel', async () => {
      const plan = await db.query.plans.findFirst({
        where: eq(schema.plans.slug, 'pro'),
      });

      const res = await testApp.request('/api/v1/saas/subscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ planId: plan!.id }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.planName).toBe('Pro');
      expect(body.data.status).toBe('active');
    });
  });

  // =====================================================================
  // Invoices
  // =====================================================================
  describe('Invoices', () => {
    it('GET /invoices - should list invoices sorted desc', async () => {
      const res = await adminApp.request('/api/v1/saas/invoices');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(5);
    });
  });

  // =====================================================================
  // Team
  // =====================================================================
  describe('Team', () => {
    it('GET /team - should list team members', async () => {
      const res = await adminApp.request('/api/v1/saas/team');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(2);
    });

    it('POST /team/invite - should reject already member (409)', async () => {
      const res = await adminApp.request('/api/v1/saas/team/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'user@example.com', role: 'member' }),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ALREADY_MEMBER');
    });

    it('PATCH /team/:id/role - should change non-owner role', async () => {
      const teamRes = await adminApp.request('/api/v1/saas/team');
      const teamBody = await teamRes.json();

      const member = teamBody.data.find((m: { role: string }) => m.role !== 'owner');
      expect(member).toBeDefined();

      const res = await adminApp.request(`/api/v1/saas/team/${member.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'viewer' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.role).toBe('viewer');

      // Revert
      await db.update(schema.teamMembers).set({ role: member.role }).where(eq(schema.teamMembers.id, member.id));
    });

    it('PATCH /team/:id/role - should not change owner role (403)', async () => {
      const teamRes = await adminApp.request('/api/v1/saas/team');
      const teamBody = await teamRes.json();

      const owner = teamBody.data.find((m: { role: string }) => m.role === 'owner');
      expect(owner).toBeDefined();

      const res = await adminApp.request(`/api/v1/saas/team/${owner.id}/role`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: 'member' }),
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CANNOT_CHANGE_OWNER');
    });

    it('DELETE /team/:id - should not remove owner (403)', async () => {
      const teamRes = await adminApp.request('/api/v1/saas/team');
      const teamBody = await teamRes.json();

      const owner = teamBody.data.find((m: { role: string }) => m.role === 'owner');
      expect(owner).toBeDefined();

      const res = await adminApp.request(`/api/v1/saas/team/${owner.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(403);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CANNOT_REMOVE_OWNER');
    });

    it('DELETE /team/:id - should remove non-owner member', async () => {
      const teamRes = await adminApp.request('/api/v1/saas/team');
      const teamBody = await teamRes.json();

      const member = teamBody.data.find((m: { role: string }) => m.role !== 'owner');
      if (!member) return;

      const res = await adminApp.request(`/api/v1/saas/team/${member.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);

      // Re-add for other tests
      const org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.ownerId, ADMIN_USER_ID),
      });
      if (org) {
        await db.insert(schema.teamMembers).values({
          id: member.id,
          organizationId: org.id,
          userId: member.userId,
          role: 'member',
          joinedAt: new Date().toISOString(),
        });
      }
    });
  });

  // =====================================================================
  // Usage
  // =====================================================================
  describe('Usage', () => {
    it('GET /usage - should return usage records with limits', async () => {
      const res = await adminApp.request('/api/v1/saas/usage');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(4);

      const metrics = body.data.map((u: { metric: string }) => u.metric);
      expect(metrics).toContain('api_calls');
      expect(metrics).toContain('storage');
      expect(metrics).toContain('members');
      expect(metrics).toContain('projects');

      // Each record has limitValue
      expect(body.data[0]).toHaveProperty('limitValue');
    });
  });

  // =====================================================================
  // Settings
  // =====================================================================
  describe('Settings', () => {
    it('GET /settings - should return org settings', async () => {
      const res = await adminApp.request('/api/v1/saas/settings');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Acme Corp');
      expect(body.data.slug).toBe('acme-corp');
    });

    it('PATCH /settings - should update org name', async () => {
      const res = await adminApp.request('/api/v1/saas/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: 'Acme Corporation' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.name).toBe('Acme Corporation');

      // Revert
      const org = await db.query.organizations.findFirst({
        where: eq(schema.organizations.slug, 'acme-corp'),
      });
      if (org) {
        await db.update(schema.organizations).set({ name: 'Acme Corp' }).where(eq(schema.organizations.id, org.id));
      }
    });
  });
});
