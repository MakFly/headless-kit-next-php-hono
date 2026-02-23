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
import { authRoutes } from './routes/index.ts';
import { requestContextMiddleware } from './middleware/index.ts';
import type { AppVariables } from './types/index.ts';

// Configuration
const port = parseInt(process.env.PORT || '8003', 10);
const apiVersion = process.env.API_VERSION || 'v1';
const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';

// Create app
const app = new Hono<{ Variables: AppVariables }>();

// Global middleware
app.use('*', logger());
app.use('*', prettyJSON());
app.use('*', secureHeaders());
app.use('*', requestContextMiddleware);

// CORS configuration
app.use(
  '*',
  cors({
    origin: [frontendUrl, 'http://localhost:3001'],
    credentials: true,
    allowHeaders: ['Content-Type', 'Authorization', 'Accept', 'X-Request-Id'],
    allowMethods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    exposeHeaders: ['Content-Length', 'X-Request-Id'],
    maxAge: 86400,
  })
);

// Health check
app.get('/', (c) => {
  return c.json({
    name: '@rbac/api-hono',
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
// Version is configurable via API_VERSION env var (default: v1)
app.route(`/api/${apiVersion}/auth`, authRoutes);

// 404 handler
app.notFound((c) => {
  return c.json(
    {
      error: 'Not Found',
      message: `Route ${c.req.method} ${c.req.path} not found`,
      code: 'NOT_FOUND',
    },
    404
  );
});

// Error handler
app.onError((err, c) => {
  console.error('Unhandled error:', err);
  const requestId = c.get('requestId');

  const response = c.json(
    {
      error: 'Internal Server Error',
      message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong',
      code: 'INTERNAL_ERROR',
      status: 500,
      request_id: requestId,
    },
    500
  );

  response.headers.set('X-Request-Id', requestId);
  return response;
});

// Start server
console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Hono API Server                                      ║
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
