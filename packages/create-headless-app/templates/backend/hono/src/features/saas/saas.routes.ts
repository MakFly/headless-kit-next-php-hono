/**
 * SaaS routes
 *
 * Merged from saas.routes.ts + org routes
 *
 * Public:    GET /plans
 * Auth only: GET/POST /orgs
 * Org-scoped (/:orgId): all other routes use inline orgRbac middleware
 *   - viewer:  GET /orgs/:orgId, GET /orgs/:orgId/dashboard
 *   - member:  GET subscription, team, usage
 *   - admin:   invite/update/remove team, GET invoices, GET/PATCH settings
 *   - owner:   POST/DELETE subscription
 */

import { Hono } from 'hono';
import * as saasHandlers from './saas.handlers.ts';
import { authMiddleware, orgRbac } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const saas = new Hono<{ Variables: AppVariables }>();

// -------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------

saas.get('/plans', (c) => saasHandlers.listPlans(c));

// -------------------------------------------------------------------------
// Auth required for all routes below
// -------------------------------------------------------------------------

saas.use('*', authMiddleware);

// -------------------------------------------------------------------------
// Org management
// -------------------------------------------------------------------------

saas.get('/orgs', (c) => saasHandlers.listOrgs(c));
saas.post('/orgs', (c) => saasHandlers.createOrg(c));

// -------------------------------------------------------------------------
// Org-scoped routes — viewer level
// -------------------------------------------------------------------------

saas.get('/orgs/:orgId', orgRbac('viewer'), (c) => saasHandlers.showOrg(c));
saas.get('/orgs/:orgId/dashboard', orgRbac('viewer'), (c) => saasHandlers.getDashboard(c));

// -------------------------------------------------------------------------
// Org-scoped routes — member level
// -------------------------------------------------------------------------

saas.get('/orgs/:orgId/subscription', orgRbac('member'), (c) => saasHandlers.getSubscription(c));
saas.get('/orgs/:orgId/team', orgRbac('member'), (c) => saasHandlers.listTeamMembers(c));
saas.get('/orgs/:orgId/usage', orgRbac('member'), (c) => saasHandlers.getUsage(c));

// -------------------------------------------------------------------------
// Org-scoped routes — admin level
// -------------------------------------------------------------------------

saas.post('/orgs/:orgId/team/invite', orgRbac('admin'), (c) => saasHandlers.inviteTeamMember(c));
saas.patch('/orgs/:orgId/team/:id/role', orgRbac('admin'), (c) => saasHandlers.updateTeamMemberRole(c));
saas.delete('/orgs/:orgId/team/:id', orgRbac('admin'), (c) => saasHandlers.removeTeamMember(c));
saas.get('/orgs/:orgId/invoices', orgRbac('admin'), (c) => saasHandlers.listInvoices(c));
saas.get('/orgs/:orgId/settings', orgRbac('admin'), (c) => saasHandlers.getSettings(c));
saas.patch('/orgs/:orgId/settings', orgRbac('admin'), (c) => saasHandlers.updateSettings(c));

// -------------------------------------------------------------------------
// Org-scoped routes — owner level
// -------------------------------------------------------------------------

saas.post('/orgs/:orgId/subscription', orgRbac('owner'), (c) => saasHandlers.subscribe(c));
saas.delete('/orgs/:orgId/subscription', orgRbac('owner'), (c) => saasHandlers.cancelSubscription(c));

export default saas;
