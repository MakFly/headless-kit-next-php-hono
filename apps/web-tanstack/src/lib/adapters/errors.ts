import { ApiException } from '../http/api-exception'

export class AdapterError extends ApiException {
  constructor(
    message: string,
    statusCode: number,
    code?: string,
    details?: unknown
  ) {
    super(message, { statusCode, code, details })
    this.name = 'AdapterError'
  }

  static fromResponse(response: Response, body?: unknown): AdapterError {
    const error = ApiException.fromResponse(response, body)
    return new AdapterError(error.message, error.statusCode, error.code, error.details)
  }

  static fromUnknown(error: unknown, fallbackMessage = 'Request failed'): AdapterError {
    const normalized = ApiException.fromUnknown(error, fallbackMessage)
    return new AdapterError(
      normalized.message,
      normalized.statusCode,
      normalized.code,
      normalized.details,
    )
  }
}
