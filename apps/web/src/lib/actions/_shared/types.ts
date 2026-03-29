/**
 * Shared types for Server Actions
 *
 * Common type definitions used across all action domains.
 */

/**
 * Paginated response from Laravel API
 */
export type PaginatedResponse<T> = {
  data: T[];
  pagination: {
    page: number;
    per_page: number;
    total: number;
    last_page: number;
  };
};

/**
 * Standard API data response wrapper
 */
export type ApiDataResponse<T> = {
  data: T;
  message?: string;
};

/**
 * Action result type for operations that can fail
 */
export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

/**
 * Options for BFF requests
 */
export type BffRequestOptions = RequestInit & {
  /**
   * Skip authentication header (for public routes)
   */
  skipAuth?: boolean;
};

/**
 * Request method type
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
