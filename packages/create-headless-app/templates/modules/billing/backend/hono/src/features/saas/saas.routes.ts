/**
 * SaaS routes
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
import * as saasHandler from './saas.handlers.ts';
import * as orgHandler from '../org/org.handlers.ts';
import { authMiddleware } from '../../shared/middleware/index.ts';
import { orgRbac } from '../../shared/middleware/org-rbac.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const saas = new Hono<{ Variables: AppVariables }>();

// -------------------------------------------------------------------------
// Public
// -------------------------------------------------------------------------

saas.get('/plans', (c) => saasHandler.listPlans(c));

// -------------------------------------------------------------------------
// Auth required for all routes below
// -------------------------------------------------------------------------

saas.use('*', authMiddleware);

// -------------------------------------------------------------------------
// Org management
// -------------------------------------------------------------------------

saas.get('/orgs', (c) => orgHandler.listOrgs(c));
saas.post('/orgs', (c) => orgHandler.createOrg(c));

// -------------------------------------------------------------------------
// Org-scoped routes — viewer level
// -------------------------------------------------------------------------

saas.get('/orgs/:orgId', orgRbac('viewer'), (c) => orgHandler.showOrg(c));
saas.get('/orgs/:orgId/dashboard', orgRbac('viewer'), (c) => saasHandler.getDashboard(c));

// -------------------------------------------------------------------------
// Org-scoped routes — member level
// -------------------------------------------------------------------------

saas.get('/orgs/:orgId/subscription', orgRbac('member'), (c) => saasHandler.getSubscription(c));
saas.get('/orgs/:orgId/team', orgRbac('member'), (c) => saasHandler.listTeamMembers(c));
saas.get('/orgs/:orgId/usage', orgRbac('member'), (c) => saasHandler.getUsage(c));

// -------------------------------------------------------------------------
// Org-scoped routes — admin level
// -------------------------------------------------------------------------

saas.post('/orgs/:orgId/team/invite', orgRbac('admin'), (c) => saasHandler.inviteTeamMember(c));
saas.patch('/orgs/:orgId/team/:id/role', orgRbac('admin'), (c) => saasHandler.updateTeamMemberRole(c));
saas.delete('/orgs/:orgId/team/:id', orgRbac('admin'), (c) => saasHandler.removeTeamMember(c));
saas.get('/orgs/:orgId/invoices', orgRbac('admin'), (c) => saasHandler.listInvoices(c));
saas.get('/orgs/:orgId/settings', orgRbac('admin'), (c) => saasHandler.getSettings(c));
saas.patch('/orgs/:orgId/settings', orgRbac('admin'), (c) => saasHandler.updateSettings(c));

// -------------------------------------------------------------------------
// Org-scoped routes — owner level
// -------------------------------------------------------------------------

saas.post('/orgs/:orgId/subscription', orgRbac('owner'), (c) => saasHandler.subscribe(c));
saas.delete('/orgs/:orgId/subscription', orgRbac('owner'), (c) => saasHandler.cancelSubscription(c));

export default saas;
