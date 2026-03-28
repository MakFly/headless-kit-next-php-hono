/**
 * Integration tests for Support endpoints
 */

import { describe, it, expect, beforeAll } from 'bun:test';
import { Hono } from 'hono';
import { createMiddleware } from 'hono/factory';
import * as supportHandler from '../../../features/support/support.handlers.ts';
import { seedSupport } from '../../../shared/db/seeders/support.seed.ts';
import { db, schema } from '../../../shared/db/index.ts';
import { eq } from 'drizzle-orm';
import { AppError } from '../../../shared/lib/errors.ts';
import { apiError } from '../../../shared/lib/response.ts';
import type { AppVariables } from '../../../shared/types/index.ts';

const ADMIN_USER_ID = 'admin-00000000-0000-0000-0000-000000000001';
const TEST_USER_ID = 'user-00000000-0000-0000-0000-000000000002';
const OTHER_USER_ID = 'user-00000000-0000-0000-0000-000000000003';

function createTestApp(userId: string, email: string) {
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
    c.set('locale', 'en');
    await next();
  });

  const app = new Hono<{ Variables: AppVariables }>();

  app.onError((err, c) => {
    if (err instanceof AppError) {
      return apiError(c, err.code, err.message, err.statusCode, err.details);
    }
    return apiError(c, 'INTERNAL_ERROR', err.message, 500);
  });

  app.use('*', fakeAuth);

  // User endpoints
  app.get('/api/v1/support/conversations', (c) => supportHandler.listConversations(c));
  app.post('/api/v1/support/conversations', (c) => supportHandler.createConversation(c));
  app.get('/api/v1/support/conversations/:id', (c) => supportHandler.getConversation(c));
  app.post('/api/v1/support/conversations/:id/messages', (c) => supportHandler.sendMessage(c));
  app.post('/api/v1/support/conversations/:id/rate', (c) => supportHandler.rateConversation(c));

  // Agent endpoints
  app.get('/api/v1/support/agent/queue', (c) => supportHandler.getAgentQueue(c));
  app.get('/api/v1/support/agent/assigned', (c) => supportHandler.getAgentAssigned(c));
  app.patch('/api/v1/support/agent/conversations/:id/assign', (c) => supportHandler.assignConversation(c));
  app.patch('/api/v1/support/agent/conversations/:id/status', (c) => supportHandler.changeStatus(c));
  app.get('/api/v1/support/agent/canned', (c) => supportHandler.listCannedResponses(c));
  app.post('/api/v1/support/agent/canned', (c) => supportHandler.createCannedResponse(c));
  app.patch('/api/v1/support/agent/canned/:id', (c) => supportHandler.updateCannedResponse(c));
  app.delete('/api/v1/support/agent/canned/:id', (c) => supportHandler.deleteCannedResponse(c));
  app.get('/api/v1/support/agent/ratings', (c) => supportHandler.getRatingStats(c));

  return app;
}

const adminApp = createTestApp(ADMIN_USER_ID, 'admin@example.com');
const testApp = createTestApp(TEST_USER_ID, 'test@test.com');
const otherApp = createTestApp(OTHER_USER_ID, 'refresh-test@example.com');

beforeAll(async () => {
  await seedSupport();
});

describe('Support Endpoints', () => {
  // =====================================================================
  // User: Conversations
  // =====================================================================
  describe('User Conversations', () => {
    it('POST /conversations - should create conversation with first message', async () => {
      const res = await testApp.request('/api/v1/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: 'Test conversation',
          message: 'This is my first message.',
          priority: 'low',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.subject).toBe('Test conversation');
      expect(body.data.status).toBe('open');
      expect(body.data.priority).toBe('low');
      expect(body.data.userId).toBe(TEST_USER_ID);
      expect(body.data.lastMessageAt).toBeDefined();
    });

    it('GET /conversations - should list own conversations', async () => {
      const res = await testApp.request('/api/v1/support/conversations');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(5);

      // All belong to test user
      for (const conv of body.data) {
        expect(conv.userId).toBe(TEST_USER_ID);
      }
    });

    it('GET /conversations/:id - should get conversation with messages', async () => {
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data[0];

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}`);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.id).toBe(conv.id);
      expect(body.data.messages).toBeArray();
    });

    it('GET /conversations/:id - should return 403 for other user', async () => {
      // Get a conversation owned by testUser
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data[0];

      const res = await otherApp.request(`/api/v1/support/conversations/${conv.id}`);
      expect(res.status).toBe(403);
    });

    it('POST /conversations/:id/messages - should send message', async () => {
      // Find an open conversation
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { status: string }) => c.status !== 'closed');

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Thanks for the help!' }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.content).toBe('Thanks for the help!');
      expect(body.data.senderType).toBe('user');
    });

    it('POST /conversations/:id/messages - should reject on closed conversation (422)', async () => {
      // Find a closed conversation owned by testUser
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { status: string }) => c.status === 'closed');

      if (!conv) return;

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: 'Hello?' }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('CONVERSATION_CLOSED');
    });

    it('POST /conversations/:id/messages - should reject without content (422)', async () => {
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { status: string }) => c.status === 'open');

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      });

      expect(res.status).toBe(422);
    });

    it('POST /conversations - should reject without required fields (422)', async () => {
      const res = await testApp.request('/api/v1/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'No message' }),
      });

      expect(res.status).toBe(422);
    });
  });

  // =====================================================================
  // User: Rating
  // =====================================================================
  describe('Rating', () => {
    it('POST /conversations/:id/rate - should rate resolved conversation', async () => {
      // Create a fresh conversation for this test
      const createRes = await testApp.request('/api/v1/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Rate test', message: 'Testing rating' }),
      });
      const created = await createRes.json();

      // Manually set to resolved via DB (skip status transitions for test convenience)
      await db.update(schema.conversations)
        .set({ status: 'resolved', agentId: ADMIN_USER_ID })
        .where(eq(schema.conversations.id, created.data.id));

      const res = await testApp.request(`/api/v1/support/conversations/${created.data.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 5 }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.rating).toBe(5);
    });

    it('POST /conversations/:id/rate - should reject rating twice (409)', async () => {
      // Find a conversation that already has a rating
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { rating: number | null }) => c.rating !== null);

      if (!conv) return;

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 3 }),
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ALREADY_RATED');
    });

    it('POST /conversations/:id/rate - should reject invalid rating (422)', async () => {
      const createRes = await testApp.request('/api/v1/support/conversations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ subject: 'Bad rating', message: 'Test' }),
      });
      const created = await createRes.json();

      await db.update(schema.conversations)
        .set({ status: 'resolved' })
        .where(eq(schema.conversations.id, created.data.id));

      const res = await testApp.request(`/api/v1/support/conversations/${created.data.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 10 }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_RATING');
    });

    it('POST /conversations/:id/rate - should reject rating non-resolved conversation (422)', async () => {
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { status: string }) => c.status === 'open');

      if (!conv) return;

      const res = await testApp.request(`/api/v1/support/conversations/${conv.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 4 }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_STATUS');
    });

    it('POST /conversations/:id/rate - should reject non-owner (403)', async () => {
      // testUser's conversation, otherUser tries to rate
      const listRes = await testApp.request('/api/v1/support/conversations');
      const listBody = await listRes.json();
      const conv = listBody.data.find((c: { status: string }) => c.status === 'resolved' || c.status === 'closed');

      if (!conv) return;

      const res = await otherApp.request(`/api/v1/support/conversations/${conv.id}/rate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rating: 4 }),
      });

      expect(res.status).toBe(403);
    });
  });

  // =====================================================================
  // Agent: Queue & Assign
  // =====================================================================
  describe('Agent Queue', () => {
    it('GET /agent/queue - should list unassigned conversations', async () => {
      const res = await adminApp.request('/api/v1/support/agent/queue');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(1);

      for (const conv of body.data) {
        expect(conv.agentId).toBeNull();
        expect(conv.status).toBe('open');
      }
    });

    it('GET /agent/assigned - should list agent assigned conversations', async () => {
      const res = await adminApp.request('/api/v1/support/agent/assigned');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(1);

      for (const conv of body.data) {
        expect(conv.agentId).toBe(ADMIN_USER_ID);
      }
    });

    it('PATCH /agent/conversations/:id/assign - should assign to self', async () => {
      const queueRes = await adminApp.request('/api/v1/support/agent/queue');
      const queueBody = await queueRes.json();
      const conv = queueBody.data[0];

      if (!conv) return;

      const res = await adminApp.request(`/api/v1/support/agent/conversations/${conv.id}/assign`, {
        method: 'PATCH',
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.agentId).toBe(ADMIN_USER_ID);
      expect(body.data.status).toBe('assigned');

      // Revert for other tests
      await db.update(schema.conversations)
        .set({ agentId: null, status: 'open', updatedAt: new Date().toISOString() })
        .where(eq(schema.conversations.id, conv.id));
    });

    it('PATCH /agent/conversations/:id/assign - should reject already assigned (409)', async () => {
      // Find an already assigned conversation
      const assignedRes = await adminApp.request('/api/v1/support/agent/assigned');
      const assignedBody = await assignedRes.json();
      const conv = assignedBody.data[0];

      if (!conv) return;

      const res = await adminApp.request(`/api/v1/support/agent/conversations/${conv.id}/assign`, {
        method: 'PATCH',
      });

      expect(res.status).toBe(409);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('ALREADY_ASSIGNED');
    });
  });

  // =====================================================================
  // Agent: Status Changes
  // =====================================================================
  describe('Agent Status', () => {
    it('PATCH /agent/conversations/:id/status - should change status with valid transition', async () => {
      // Find an assigned conversation
      const assignedRes = await adminApp.request('/api/v1/support/agent/assigned');
      const assignedBody = await assignedRes.json();
      const conv = assignedBody.data.find((c: { status: string }) => c.status === 'assigned');

      if (!conv) return;

      const res = await adminApp.request(`/api/v1/support/agent/conversations/${conv.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'waiting' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.status).toBe('waiting');

      // Revert
      await db.update(schema.conversations)
        .set({ status: 'assigned', updatedAt: new Date().toISOString() })
        .where(eq(schema.conversations.id, conv.id));
    });

    it('PATCH /agent/conversations/:id/status - should reject invalid transition (422)', async () => {
      // Try to go from open to closed directly
      const queueRes = await adminApp.request('/api/v1/support/agent/queue');
      const queueBody = await queueRes.json();
      const conv = queueBody.data[0];

      if (!conv) return;

      const res = await adminApp.request(`/api/v1/support/agent/conversations/${conv.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'closed' }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('INVALID_TRANSITION');
    });
  });

  // =====================================================================
  // Agent: Canned Responses
  // =====================================================================
  describe('Canned Responses', () => {
    it('GET /agent/canned - should list canned responses', async () => {
      const res = await adminApp.request('/api/v1/support/agent/canned');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toBeArray();
      expect(body.data.length).toBeGreaterThanOrEqual(5);
    });

    it('POST /agent/canned - should create a canned response', async () => {
      const res = await adminApp.request('/api/v1/support/agent/canned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: 'Test Response',
          content: 'This is a test canned response.',
          category: 'test',
          shortcut: '/test',
        }),
      });

      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Test Response');
      expect(body.data.content).toBe('This is a test canned response.');
      expect(body.data.createdBy).toBe(ADMIN_USER_ID);
    });

    it('POST /agent/canned - should reject missing required fields (422)', async () => {
      const res = await adminApp.request('/api/v1/support/agent/canned', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'No content' }),
      });

      expect(res.status).toBe(422);
      const body = await res.json();
      expect(body.success).toBe(false);
      expect(body.error.code).toBe('VALIDATION_ERROR');
    });

    it('PATCH /agent/canned/:id - should update a canned response', async () => {
      const listRes = await adminApp.request('/api/v1/support/agent/canned');
      const listBody = await listRes.json();
      const canned = listBody.data.find((c: { shortcut: string }) => c.shortcut === '/test');

      if (!canned) return;

      const res = await adminApp.request(`/api/v1/support/agent/canned/${canned.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: 'Updated Test Response' }),
      });

      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data.title).toBe('Updated Test Response');
    });

    it('DELETE /agent/canned/:id - should delete a canned response', async () => {
      const listRes = await adminApp.request('/api/v1/support/agent/canned');
      const listBody = await listRes.json();
      const canned = listBody.data.find((c: { shortcut: string }) => c.shortcut === '/test');

      if (!canned) return;

      const res = await adminApp.request(`/api/v1/support/agent/canned/${canned.id}`, {
        method: 'DELETE',
      });

      expect(res.status).toBe(200);
      expect((await res.json()).success).toBe(true);
    });
  });

  // =====================================================================
  // Agent: CSAT Ratings Stats
  // =====================================================================
  describe('CSAT Ratings', () => {
    it('GET /agent/ratings - should return CSAT statistics', async () => {
      const res = await adminApp.request('/api/v1/support/agent/ratings');
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.success).toBe(true);
      expect(body.data).toHaveProperty('average');
      expect(body.data).toHaveProperty('total');
      expect(body.data).toHaveProperty('distribution');
      expect(body.data.total).toBeGreaterThanOrEqual(4); // seeded conversations have ratings
      expect(body.data.distribution).toHaveProperty('1');
      expect(body.data.distribution).toHaveProperty('2');
      expect(body.data.distribution).toHaveProperty('3');
      expect(body.data.distribution).toHaveProperty('4');
      expect(body.data.distribution).toHaveProperty('5');
    });
  });
});
