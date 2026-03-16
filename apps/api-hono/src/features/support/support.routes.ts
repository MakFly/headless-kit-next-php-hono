/**
 * Support routes
 */

import { Hono } from 'hono';
import * as supportHandlers from './support.handlers.ts';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const support = new Hono<{ Variables: AppVariables }>();

// All support routes require auth
support.use('*', authMiddleware);

// User endpoints
support.get('/conversations', (c) => supportHandlers.listConversations(c));
support.post('/conversations', (c) => supportHandlers.createConversation(c));
support.get('/conversations/:id', (c) => supportHandlers.getConversation(c));
support.post('/conversations/:id/messages', (c) => supportHandlers.sendMessage(c));
support.post('/conversations/:id/rate', (c) => supportHandlers.rateConversation(c));

// Agent endpoints (admin required)
support.get('/agent/queue', adminMiddleware, (c) => supportHandlers.getAgentQueue(c));
support.get('/agent/assigned', adminMiddleware, (c) => supportHandlers.getAgentAssigned(c));
support.patch('/agent/conversations/:id/assign', adminMiddleware, (c) => supportHandlers.assignConversation(c));
support.patch('/agent/conversations/:id/status', adminMiddleware, (c) => supportHandlers.changeStatus(c));
support.get('/agent/canned', adminMiddleware, (c) => supportHandlers.listCannedResponses(c));
support.post('/agent/canned', adminMiddleware, (c) => supportHandlers.createCannedResponse(c));
support.patch('/agent/canned/:id', adminMiddleware, (c) => supportHandlers.updateCannedResponse(c));
support.delete('/agent/canned/:id', adminMiddleware, (c) => supportHandlers.deleteCannedResponse(c));
support.get('/agent/ratings', adminMiddleware, (c) => supportHandlers.getRatingStats(c));

export default support;
