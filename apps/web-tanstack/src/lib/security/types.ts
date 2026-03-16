export enum BffErrorCode {
  UPSTREAM_ERROR = 'UPSTREAM_ERROR',
  NETWORK_ERROR = 'NETWORK_ERROR',
  TIMEOUT = 'TIMEOUT',
}

export class BffException extends Error {
  constructor(
    public code: BffErrorCode,
    message: string,
    public details?: unknown
  ) {
    super(message)
    this.name = 'BffException'
  }

  toJSON() {
    return { code: this.code, message: this.message, details: this.details }
  }
}
