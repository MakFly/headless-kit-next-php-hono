/**
 * Shared types for Server Actions
 */

/**
 * Paginated response from API
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
  skipAuth?: boolean;
};

/**
 * Request method type
 */
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
