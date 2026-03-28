/**
 * Unwrap standardized API envelope format
 *
 * Handles both new envelope { success, data, meta, status, request_id }
 * and legacy formats (flat or { data: T }) for backwards compatibility.
 */

export type ApiEnvelope<T> = {
  success: boolean;
  data: T;
  meta?: Record<string, unknown>;
  status: number;
  request_id: string;
};

export type ApiErrorEnvelope = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  status: number;
  request_id: string;
};

/**
 * Unwrap an API response that may be in envelope format.
 * Returns the data payload directly.
 */
export function unwrapEnvelope<T>(response: unknown): T {
  if (!response || typeof response !== 'object') {
    return response as T;
  }

  const res = response as Record<string, unknown>;

  // Check for error envelope
  if (res.success === false && res.error) {
    const err = res.error as { code?: string; message?: string; details?: unknown };
    const error = new Error(err.message || 'API Error');
    (error as Error & { code?: string; details?: unknown }).code = err.code;
    (error as Error & { code?: string; details?: unknown }).details = err.details;
    throw error;
  }

  // Envelope format: { success, data, ... }
  if ('success' in res && 'data' in res) {
    return res.data as T;
  }

  // Legacy format: { data: T }
  if ('data' in res && !('success' in res)) {
    return res.data as T;
  }

  // Flat format
  return response as T;
}

/**
 * Unwrap a paginated API response.
 * Handles both new format (meta) and legacy format (pagination).
 */
export type PaginationMeta = {
  page: number;
  perPage: number;
  total: number;
  totalPages: number;
};

export type UnwrappedPaginated<T> = {
  data: T[];
  pagination: PaginationMeta;
};

export function unwrapPaginated<T>(response: unknown): UnwrappedPaginated<T> {
  const res = response as Record<string, unknown>;

  // New envelope format: { success, data: [...], meta: { page, perPage, total, totalPages } }
  if (Array.isArray(res.data) && res.meta) {
    return {
      data: res.data as T[],
      pagination: res.meta as PaginationMeta,
    };
  }

  // Legacy format: { data: [...], pagination: {...} }
  if (Array.isArray(res.data) && res.pagination) {
    return res as unknown as UnwrappedPaginated<T>;
  }

  // Fallback: raw array
  if (Array.isArray(res)) {
    return {
      data: res as T[],
      pagination: { page: 1, perPage: res.length, total: res.length, totalPages: 1 },
    };
  }

  return res as unknown as UnwrappedPaginated<T>;
}
