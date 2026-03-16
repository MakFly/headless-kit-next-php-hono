/**
 * Types for BFF security
 */

/**
 * Standardized BFF error
 */
export type BffError = {
  code: BffErrorCode;
  message: string;
  details?: unknown;
};

/**
 * BFF error codes
 */
export enum BffErrorCode {
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
}

/**
 * BFF exception for controlled errors
 */
export class BffException extends Error {
  constructor(
    public code: BffErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message);
    this.name = 'BffException';
  }

  toJSON(): BffError {
    return {
      code: this.code,
      message: this.message,
      details: this.details,
    };
  }
}

/**
 * BFF configuration
 */
export type BffConfig = {
  apiUrl: string;
  timeout: number;
};

/**
 * BFF request result
 */
export type BffResponse<T = unknown> = {
  data: T;
  status: number;
  headers: Headers;
};

/**
 * BFF request options
 */
export type BffRequestOptions = {
  method: string;
  path: string;
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
};
