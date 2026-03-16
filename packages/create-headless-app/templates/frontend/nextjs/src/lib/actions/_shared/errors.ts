/**
 * Unified error classes for Server Actions
 */

import { AdapterError } from '../../adapters/errors';
import { ApiException } from '../../http/api-exception';

/**
 * Base error class for all Server Actions
 */
export class ActionError extends Error {
  constructor(
    message: string,
    public readonly statusCode: number,
    public readonly code?: string,
    public readonly details?: unknown
  ) {
    super(message);
    this.name = 'ActionError';
  }

  static fromAdapterError(error: unknown): ActionError {
    if (error instanceof ActionError) {
      return error;
    }

    if (error instanceof ApiException) {
      return new ActionError(
        error.message,
        error.statusCode,
        error.code,
        error.details
      );
    }

    if (error instanceof AdapterError) {
      return new ActionError(
        error.message,
        error.statusCode,
        error.code,
        error.details
      );
    }

    if (error instanceof Error) {
      return new ActionError(error.message, 500, 'UNKNOWN_ERROR');
    }

    return new ActionError('Unknown error', 500, 'UNKNOWN_ERROR');
  }

  isAuthError(): boolean {
    return this.statusCode === 401 || this.statusCode === 403;
  }

  isValidationError(): boolean {
    return this.statusCode === 422;
  }

  isNotFoundError(): boolean {
    return this.statusCode === 404;
  }
}

/**
 * Specialized error for authentication operations
 */
export class AuthActionError extends ActionError {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message, statusCode, code, details);
    this.name = 'AuthActionError';
  }

  static fromAdapterError(error: unknown): AuthActionError {
    const base = ActionError.fromAdapterError(error);
    return new AuthActionError(
      base.message,
      base.statusCode,
      base.code,
      base.details
    );
  }
}

/**
 * Specialized error for BFF operations
 */
export class BffActionError extends ActionError {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message, statusCode, code, details);
    this.name = 'BffActionError';
  }
}

/**
 * Helper to throw an ActionError from any error type
 */
export function throwActionError(error: unknown): never {
  throw ActionError.fromAdapterError(error);
}

/**
 * Helper to throw an AuthActionError from any error type
 */
export function throwAuthError(error: unknown): never {
  throw AuthActionError.fromAdapterError(error);
}
