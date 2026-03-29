/**
 * Admin service
 */

import * as adminRepository from './admin.repository.ts';
import * as shopRepository from '../shop/shop.repository.ts';
import { AppError } from '../../shared/lib/errors.ts';

// =========================================================================
// Products
// =========================================================================

export async function createProduct(data: Parameters<typeof adminRepository.createProduct>[0]) {
  return adminRepository.createProduct(data);
}

export async function updateProduct(id: string, data: Parameters<typeof adminRepository.updateProduct>[1]) {
  const product = await adminRepository.updateProduct(id, data);
  if (!product) {
    throw new AppError('Product not found', 'NOT_FOUND', 404);
  }
  return product;
}

export async function deleteProduct(id: string) {
  const deleted = await adminRepository.deleteProduct(id);
  if (!deleted) {
    throw new AppError('Product not found', 'NOT_FOUND', 404);
  }
}

export async function getProducts(filters: Parameters<typeof shopRepository.findAllProducts>[0]) {
  const [data, total] = await Promise.all([
    shopRepository.findAllProducts(filters),
    shopRepository.countProducts(filters),
  ]);

  const page = filters?.page || 1;
  const perPage = filters?.per_page || 20;

  return {
    data,
    pagination: {
      page,
      perPage,
      total,
      totalPages: Math.ceil(total / perPage),
    },
  };
}

// =========================================================================
// Orders
// =========================================================================

export async function getOrders(filters: { status?: string; page?: number; per_page?: number }) {
  return adminRepository.findAllOrders(filters);
}

export async function updateOrderStatus(id: string, status: string) {
  const validStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  if (!validStatuses.includes(status)) {
    throw new AppError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`, 'INVALID_STATUS', 422);
  }

  const order = await adminRepository.updateOrderStatus(id, status);
  if (!order) {
    throw new AppError('Order not found', 'NOT_FOUND', 404);
  }
  return order;
}

// =========================================================================
// Dashboard & Analytics
// =========================================================================

export async function getDashboard() {
  return adminRepository.getDashboardStats();
}

export async function getRevenueAnalytics() {
  return adminRepository.getRevenueAnalytics();
}

export async function getTopProducts(limit?: number) {
  return adminRepository.getTopProducts(limit);
}

// =========================================================================
// Inventory
// =========================================================================

export async function getInventory(page?: number, perPage?: number) {
  return adminRepository.getInventory(page, perPage);
}

export async function updateStock(productId: string, stockQuantity: number) {
  if (stockQuantity < 0) {
    throw new AppError('Stock quantity cannot be negative', 'INVALID_STOCK', 422);
  }

  const product = await adminRepository.updateStock(productId, stockQuantity);
  if (!product) {
    throw new AppError('Product not found', 'NOT_FOUND', 404);
  }
  return product;
}

// =========================================================================
// Customers
// =========================================================================

export async function getCustomers(filters: { segment?: string; search?: string; page?: number; per_page?: number }) {
  return adminRepository.findAllCustomers(filters);
}

export async function getCustomer(id: string) {
  const customer = await adminRepository.findCustomerById(id);
  if (!customer) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }
  return customer;
}

export async function createCustomer(data: Parameters<typeof adminRepository.createCustomer>[0]) {
  return adminRepository.createCustomer(data);
}

export async function updateCustomer(id: string, data: Parameters<typeof adminRepository.updateCustomer>[1]) {
  const customer = await adminRepository.updateCustomer(id, data);
  if (!customer) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }
  return customer;
}

export async function deleteCustomer(id: string) {
  const deleted = await adminRepository.deleteCustomer(id);
  if (!deleted) {
    throw new AppError('Customer not found', 'NOT_FOUND', 404);
  }
}

// =========================================================================
// Reviews
// =========================================================================

export async function getReviews(filters: { status?: string; rating?: number; page?: number; per_page?: number }) {
  return adminRepository.findAllReviews(filters);
}

export async function getReview(id: string) {
  const review = await adminRepository.findReviewById(id);
  if (!review) {
    throw new AppError('Review not found', 'NOT_FOUND', 404);
  }
  return review;
}

export async function updateReview(id: string, data: { rating?: number; comment?: string; status?: string }) {
  const review = await adminRepository.updateReview(id, data);
  if (!review) {
    throw new AppError('Review not found', 'NOT_FOUND', 404);
  }
  return review;
}

export async function bulkApproveReviews(ids: string[]) {
  return adminRepository.bulkUpdateReviewStatus(ids, 'approved');
}

export async function bulkRejectReviews(ids: string[]) {
  return adminRepository.bulkUpdateReviewStatus(ids, 'rejected');
}

// =========================================================================
// Segments
// =========================================================================

export async function getSegments(page?: number, perPage?: number) {
  return adminRepository.findAllSegments(page, perPage);
}
