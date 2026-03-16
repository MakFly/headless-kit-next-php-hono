/**
 * Application error class — single source of truth for all domain errors.
 * Replaces AuthError, CartError, OrderError, AdminError, SaasError, SupportError.
 */

export class AppError extends Error {
  readonly code: string;
  readonly statusCode: number;
  readonly details?: unknown;

  constructor(message: string, code: string, statusCode: number = 400, details?: unknown) {
    super(message);
    this.name = 'AppError';
    this.code = code;
    this.statusCode = statusCode;
    this.details = details;
  }
}
