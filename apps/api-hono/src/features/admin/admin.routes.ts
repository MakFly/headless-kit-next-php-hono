/**
 * Admin routes
 */

import { Hono } from 'hono';
import * as adminHandlers from './admin.handlers.ts';
import { authMiddleware, adminMiddleware } from '../../shared/middleware/index.ts';
import type { AppVariables } from '../../shared/types/index.ts';

const admin = new Hono<{ Variables: AppVariables }>();

admin.use('*', authMiddleware);
admin.use('*', adminMiddleware);

// Products CRUD
admin.get('/products', (c) => adminHandlers.listProducts(c));
admin.post('/products', (c) => adminHandlers.createProduct(c));
admin.put('/products/:id', (c) => adminHandlers.updateProduct(c));
admin.delete('/products/:id', (c) => adminHandlers.deleteProduct(c));

// Orders
admin.get('/orders', (c) => adminHandlers.listOrders(c));
admin.patch('/orders/:id/status', (c) => adminHandlers.updateOrderStatus(c));

// Dashboard
admin.get('/dashboard', (c) => adminHandlers.getDashboard(c));

// Analytics
admin.get('/analytics/revenue', (c) => adminHandlers.getRevenueAnalytics(c));
admin.get('/analytics/top-products', (c) => adminHandlers.getTopProducts(c));

// Inventory
admin.get('/inventory', (c) => adminHandlers.getInventory(c));
admin.patch('/inventory/:productId', (c) => adminHandlers.updateInventory(c));

// Customers CRUD
admin.get('/customers', (c) => adminHandlers.listCustomers(c));
admin.post('/customers', (c) => adminHandlers.createCustomer(c));
admin.get('/customers/:id', (c) => adminHandlers.getCustomer(c));
admin.put('/customers/:id', (c) => adminHandlers.updateCustomer(c));
admin.delete('/customers/:id', (c) => adminHandlers.deleteCustomer(c));

// Reviews
admin.get('/reviews', (c) => adminHandlers.listReviews(c));
admin.get('/reviews/:id', (c) => adminHandlers.getReview(c));
admin.put('/reviews/:id', (c) => adminHandlers.updateReview(c));
admin.post('/reviews/bulk-approve', (c) => adminHandlers.bulkApproveReviews(c));
admin.post('/reviews/bulk-reject', (c) => adminHandlers.bulkRejectReviews(c));

// Segments
admin.get('/segments', (c) => adminHandlers.listSegments(c));

export default admin;
