/**
 * Shared types for Server Actions
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

export type ApiDataResponse<T> = {
  data: T;
  message?: string;
};

export type ActionResult<T> =
  | { success: true; data: T }
  | { success: false; error: string; code?: string };

export type BffRequestOptions = RequestInit & {
  skipAuth?: boolean;
};

export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
