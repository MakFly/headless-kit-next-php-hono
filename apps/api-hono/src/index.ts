/**
 * Hono API Server
 *
 * A clean Node.js backend for authentication compatible with the Next.js BFF adapter.
 */

import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { logger } from 'hono/logger';
import { prettyJSON } from 'hono/pretty-json';
import { secureHeaders } from 'hono/secure-headers';
import { HTTPException } from 'hono/http-exception';
import authRoutes from './features/auth/auth.routes.ts';
import shopRoutes from './features/shop/shop.routes.ts';
import cartRoutes from './features/cart/cart.routes.ts';
import orderRoutes from './features/orders/orders.routes.ts';
import adminRoutes from './features/admin/admin.routes.ts';
import saasRoutes from './features/saas/saas.routes.ts';
import supportRoutes from './features/support/support.routes.ts';
import { requestContextMiddleware, i18nMiddleware } from './shared/middleware/index.ts';
import { AppError } from './shared/lib/errors.ts';
import { apiError } from './shared/lib/response.ts';
import { t } from './shared/lib/i18n/index.ts';
import type { AppVariables } from './shared/types/index.ts';

// Configuration
const port = parseInt(process.env.PORT || '3333', 10);
const apiVersion = process.env.API_VERSION || 'v1';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3301';

// Create app
const app = new Hono<{ Variables: AppVariables }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', requestContextMiddleware);
app.use('*', i18nMiddleware);

// CORS configuration
app.use(
  '*',
  cors({
    origin: [frontendUrl, 'http://localhost:3300'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id', 'Accept-Language'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: '@headless/api-hono',
    version: '0.1.0',
    apiVersion,
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

app.get('/health', (c) => {
  return c.json({ status: 'ok', apiVersion });
});

// Auth routes at /api/{version}/auth/*
app.route(`/api/${apiVersion}/auth`, authRoutes);

// Shop routes at /api/{version}/*
app.route(`/api/${apiVersion}`, shopRoutes);

// Cart routes at /api/{version}/cart/*
app.route(`/api/${apiVersion}/cart`, cartRoutes);

// Order routes at /api/{version}/orders/*
app.route(`/api/${apiVersion}/orders`, orderRoutes);

// Admin routes at /api/{version}/admin/*
app.route(`/api/${apiVersion}/admin`, adminRoutes);

// SaaS routes at /api/{version}/saas/*
app.route(`/api/${apiVersion}/saas`, saasRoutes);

// Support routes at /api/{version}/support/*
app.route(`/api/${apiVersion}/support`, supportRoutes);

// 404 handler
app.notFound((c) => {
  const locale = c.get('locale') ?? 'en';
  const message = t(locale, 'common.route_not_found', {
    method: c.req.method,
    path: c.req.path,
  });
  return apiError(c, 'NOT_FOUND', message, 404);
});

// Global error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  const locale = c.get('locale') ?? 'en';

  if (err instanceof AppError) {
    return apiError(c, err.code, err.message, err.statusCode, err.details);
  }

  if (err instanceof HTTPException) {
    const message = t(locale, 'common.unauthorized');
    return apiError(c, 'UNAUTHORIZED', message, err.status);
  }

  const message =
    process.env.NODE_ENV === 'development'
      ? err.message
      : t(locale, 'common.something_went_wrong');

  return apiError(c, 'INTERNAL_ERROR', message, 500);
});

// Start server
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   Hono API Server                                         ║
║                                                           ║
║   Server running on http://localhost:${port}                 ║
║   API Version: ${apiVersion}                                        ║
║   Environment: ${(process.env.NODE_ENV || 'development').padEnd(11)}                   ║
║                                                           ║
║   Endpoints:                                              ║
║   - POST /api/${apiVersion}/auth/register                            ║
║   - POST /api/${apiVersion}/auth/login                               ║
║   - POST /api/${apiVersion}/auth/refresh                             ║
║   - POST /api/${apiVersion}/auth/logout                              ║
║   - GET  /api/${apiVersion}/auth/me                                  ║
║   - GET  /api/${apiVersion}/auth/oauth/providers  (SSO)              ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
`);

export default {
  port,
  fetch: app.fetch,
};

// Export API version for tests
export { apiVersion };
