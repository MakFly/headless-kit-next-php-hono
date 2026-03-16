/**
 * Unified error classes for Server Actions
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

  static fromUnknown(error: unknown): ActionError {
    if (error instanceof ActionError) {
      return error;
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

  static fromUnknown(error: unknown): AuthActionError {
    const base = ActionError.fromUnknown(error);
    return new AuthActionError(base.message, base.statusCode, base.code, base.details);
  }
}

export class RbacActionError extends ActionError {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message, statusCode, code, details);
    this.name = 'RbacActionError';
  }

  static fromUnknown(error: unknown): RbacActionError {
    const base = ActionError.fromUnknown(error);
    return new RbacActionError(base.message, base.statusCode, base.code, base.details);
  }
}

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

export function throwActionError(error: unknown): never {
  throw ActionError.fromUnknown(error);
}

export function throwAuthError(error: unknown): never {
  throw AuthActionError.fromUnknown(error);
}

export function throwRbacError(error: unknown): never {
  throw RbacActionError.fromUnknown(error);
}
