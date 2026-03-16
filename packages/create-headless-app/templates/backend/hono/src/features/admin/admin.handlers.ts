/**
 * Admin handlers
 */

import type { Context } from 'hono';
import * as adminService from './admin.service.ts';
import { AppError } from '../../shared/lib/errors.ts';
import { apiSuccess } from '../../shared/lib/response.ts';
import type { AppVariables } from '../../shared/types/index.ts';

// =========================================================================
// Products CRUD
// =========================================================================

export async function listProducts(c: Context<{ Variables: AppVariables }>) {
  const query = c.req.query();
  const result = await adminService.getProducts({
    category: query.category,
    search: query.search,
    sort: query.sort,
    min_price: query.min_price ? parseInt(query.min_price, 10) : undefined,
    max_price: query.max_price ? parseInt(query.max_price, 10) : undefined,
    page: query.page ? parseInt(query.page, 10) : 1,
    per_page: query.per_page ? parseInt(query.per_page, 10) : 20,
  });

  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    per_page: pagination.perPage,
    total: pagination.total,
    total_pages: pagination.totalPages,
  });
}

export async function createProduct(c: Context<{ Variables: AppVariables }>) {
  const body = await c.req.json();

  if (!body.name || !body.slug || body.price === undefined) {
    throw new AppError('name, slug, and price are required', 'VALIDATION_ERROR', 400);
  }

  const product = await adminService.createProduct(body);
  return apiSuccess(c, product, undefined, 201);
}

export async function updateProduct(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const product = await adminService.updateProduct(id, body);
  return apiSuccess(c, product);
}

export async function deleteProduct(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  await adminService.deleteProduct(id);
  return apiSuccess(c, { message: 'Product deleted' });
}

// =========================================================================
// Orders
// =========================================================================

export async function listOrders(c: Context<{ Variables: AppVariables }>) {
  const query = c.req.query();
  const result = await adminService.getOrders({
    status: query.status,
    page: query.page ? parseInt(query.page, 10) : 1,
    per_page: query.per_page ? parseInt(query.per_page, 10) : 20,
  });
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  });
}

export async function updateOrderStatus(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();

  if (!body.status) {
    throw new AppError('status is required', 'VALIDATION_ERROR', 400);
  }

  const order = await adminService.updateOrderStatus(id, body.status);
  return apiSuccess(c, order);
}

// =========================================================================
// Dashboard & Analytics
// =========================================================================

export async function getDashboard(c: Context<{ Variables: AppVariables }>) {
  const stats = await adminService.getDashboard();
  return apiSuccess(c, stats);
}

export async function getRevenueAnalytics(c: Context<{ Variables: AppVariables }>) {
  const analytics = await adminService.getRevenueAnalytics();
  return apiSuccess(c, analytics);
}

export async function getTopProducts(c: Context<{ Variables: AppVariables }>) {
  const products = await adminService.getTopProducts();
  return apiSuccess(c, products);
}

// =========================================================================
// Inventory
// =========================================================================

export async function getInventory(c: Context<{ Variables: AppVariables }>) {
  const inventory = await adminService.getInventory();
  return apiSuccess(c, inventory);
}

export async function updateInventory(c: Context<{ Variables: AppVariables }>) {
  const productId = c.req.param('productId');
  const body = await c.req.json();

  if (body.stockQuantity === undefined) {
    throw new AppError('stockQuantity is required', 'VALIDATION_ERROR', 400);
  }

  const product = await adminService.updateStock(productId, body.stockQuantity);
  return apiSuccess(c, product);
}

// =========================================================================
// Customers CRUD
// =========================================================================

export async function listCustomers(c: Context<{ Variables: AppVariables }>) {
  const query = c.req.query();
  const result = await adminService.getCustomers({
    segment: query.segment,
    search: query.search,
    page: query.page ? parseInt(query.page, 10) : 1,
    per_page: query.per_page ? parseInt(query.per_page, 10) : 20,
  });
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  });
}

export async function getCustomer(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const customer = await adminService.getCustomer(id);
  return apiSuccess(c, customer);
}

export async function createCustomer(c: Context<{ Variables: AppVariables }>) {
  const body = await c.req.json();

  if (!body.firstName || !body.lastName || !body.email) {
    throw new AppError('firstName, lastName, and email are required', 'VALIDATION_ERROR', 400);
  }

  const customer = await adminService.createCustomer(body);
  return apiSuccess(c, customer, undefined, 201);
}

export async function updateCustomer(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const customer = await adminService.updateCustomer(id, body);
  return apiSuccess(c, customer);
}

export async function deleteCustomer(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  await adminService.deleteCustomer(id);
  return apiSuccess(c, { message: 'Customer deleted' });
}

// =========================================================================
// Reviews
// =========================================================================

export async function listReviews(c: Context<{ Variables: AppVariables }>) {
  const query = c.req.query();
  const result = await adminService.getReviews({
    status: query.status,
    rating: query.rating ? parseInt(query.rating, 10) : undefined,
    page: query.page ? parseInt(query.page, 10) : 1,
    per_page: query.per_page ? parseInt(query.per_page, 10) : 20,
  });
  const { data, pagination } = result;
  return apiSuccess(c, data, {
    page: pagination.page,
    perPage: pagination.perPage,
    total: pagination.total,
    totalPages: pagination.totalPages,
  });
}

export async function getReview(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const review = await adminService.getReview(id);
  return apiSuccess(c, review);
}

export async function updateReview(c: Context<{ Variables: AppVariables }>) {
  const id = c.req.param('id');
  const body = await c.req.json();
  const review = await adminService.updateReview(id, body);
  return apiSuccess(c, review);
}

export async function bulkApproveReviews(c: Context<{ Variables: AppVariables }>) {
  const body = await c.req.json();
  if (!body.ids || !Array.isArray(body.ids)) {
    throw new AppError('ids array is required', 'VALIDATION_ERROR', 400);
  }
  const result = await adminService.bulkApproveReviews(body.ids);
  return apiSuccess(c, result);
}

export async function bulkRejectReviews(c: Context<{ Variables: AppVariables }>) {
  const body = await c.req.json();
  if (!body.ids || !Array.isArray(body.ids)) {
    throw new AppError('ids array is required', 'VALIDATION_ERROR', 400);
  }
  const result = await adminService.bulkRejectReviews(body.ids);
  return apiSuccess(c, result);
}

// =========================================================================
// Segments
// =========================================================================

export async function listSegments(c: Context<{ Variables: AppVariables }>) {
  const segments = await adminService.getSegments();
  return apiSuccess(c, segments);
}
