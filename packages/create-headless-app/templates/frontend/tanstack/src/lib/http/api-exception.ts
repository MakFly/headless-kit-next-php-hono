const DEFAULT_ERROR_MESSAGES: Record<number, string> = {
  400: 'Bad request',
  401: 'Unauthorized',
  403: 'Forbidden',
  404: 'Resource not found',
  408: 'Request timeout',
  409: 'Conflict',
  422: 'Validation failed',
  429: 'Too many requests',
  500: 'Internal server error',
  502: 'Bad gateway',
  503: 'Service unavailable',
  504: 'Gateway timeout',
}

type ApiExceptionInit = {
  statusCode?: number
  code?: string
  details?: unknown
  cause?: unknown
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null
}

function normalizeStatusCode(value: unknown, fallback = 500): number {
  if (typeof value === 'number' && Number.isInteger(value) && value >= 100 && value <= 599) {
    return value
  }
  return fallback
}

function getStringField(body: Record<string, unknown>, keys: string[]): string | undefined {
  for (const key of keys) {
    const value = body[key]
    if (typeof value === 'string' && value.trim()) {
      return value.trim()
    }
  }
  return undefined
}

export function getDefaultErrorMessage(statusCode: number): string {
  if (DEFAULT_ERROR_MESSAGES[statusCode]) return DEFAULT_ERROR_MESSAGES[statusCode]
  if (statusCode >= 500) return 'Server error'
  if (statusCode >= 400) return 'Request failed'
  return 'Unexpected error'
}

export class ApiException extends Error {
  public readonly statusCode: number
  public readonly code?: string
  public readonly details?: unknown
  public readonly cause?: unknown

  constructor(message: string, init: ApiExceptionInit = {}) {
    super(message || getDefaultErrorMessage(normalizeStatusCode(init.statusCode)))
    this.name = 'ApiException'
    this.statusCode = normalizeStatusCode(init.statusCode)
    this.code = init.code
    this.details = init.details
    this.cause = init.cause
  }

  get status(): number {
    return this.statusCode
  }

  isClientError(): boolean {
    return this.statusCode >= 400 && this.statusCode < 500
  }

  isServerError(): boolean {
    return this.statusCode >= 500
  }

  toJSON(): Record<string, unknown> {
    return {
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    }
  }

  static getStatusCode(error: unknown): number | null {
    if (error instanceof ApiException) return error.statusCode

    if (error instanceof Response) {
      return normalizeStatusCode(error.status, 500)
    }

    if (isRecord(error)) {
      const directStatus =
        typeof error.statusCode === 'number'
          ? error.statusCode
          : typeof error.status === 'number'
            ? error.status
            : null

      return directStatus === null
        ? null
        : normalizeStatusCode(directStatus, 500)
    }

    return null
  }

  static fromResponse(response: Response, body?: unknown): ApiException {
    const fallbackMessage =
      response.statusText?.trim() || getDefaultErrorMessage(response.status) || `HTTP ${response.status}`

    let message = fallbackMessage
    let code: string | undefined
    let details: unknown
    let statusCode = response.status

    if (typeof body === 'string' && body.trim()) {
      message = body.trim()
    } else if (isRecord(body)) {
      message = getStringField(body, ['message', 'error', 'title']) || fallbackMessage
      code = getStringField(body, ['code', 'error_code', 'type'])
      details = body.errors ?? body.details
      statusCode = normalizeStatusCode(body.statusCode ?? body.status, response.status)
    }

    return new ApiException(message, {
      statusCode,
      code,
      details,
    })
  }

  static fromUnknown(error: unknown, fallbackMessage = 'Unexpected error'): ApiException {
    if (error instanceof ApiException) return error

    if (error instanceof Response) {
      return new ApiException(error.statusText || getDefaultErrorMessage(error.status), {
        statusCode: error.status,
        cause: error,
      })
    }

    if (error instanceof Error) {
      const record = error as Error & {
        statusCode?: unknown
        status?: unknown
        code?: unknown
        details?: unknown
      }

      return new ApiException(error.message || fallbackMessage, {
        statusCode: normalizeStatusCode(record.statusCode ?? record.status, 500),
        code: typeof record.code === 'string' ? record.code : undefined,
        details: record.details,
        cause: error,
      })
    }

    if (isRecord(error)) {
      const message = getStringField(error, ['message', 'error']) || fallbackMessage
      const code = getStringField(error, ['code', 'error_code'])
      return new ApiException(message, {
        statusCode: normalizeStatusCode(error.statusCode ?? error.status, 500),
        code,
        details: error.details ?? error.errors,
        cause: error,
      })
    }

    return new ApiException(fallbackMessage, {
      statusCode: 500,
      cause: error,
    })
  }
}
