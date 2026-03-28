export type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export type LogContext = {
  [key: string]: unknown;
};

export type Logger = {
  trace(message: string, context?: LogContext): void;
  debug(message: string, context?: LogContext): void;
  info(message: string, context?: LogContext): void;
  warn(message: string, context?: LogContext): void;
  error(message: string, context?: LogContext): void;
  fatal(message: string, context?: LogContext): void;
  child(bindings: LogContext): Logger;
};

export type LogEntry = {
  level: LogLevel;
  message: string;
  context?: LogContext;
  module: string;
  timestamp: string;
  environment: 'server' | 'client' | 'edge';
};

export const LOG_LEVELS: Record<LogLevel, number> = {
  trace: 10,
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
  fatal: 60,
};

export const REDACTED_KEYS = [
  'password',
  'token',
  'secret',
  'authorization',
  'cookie',
  'api_key',
  'apiKey',
  'accessToken',
  'refreshToken',
  'access_token',
  'refresh_token',
  'creditCard',
  'credit_card',
  'ssn',
  'privateKey',
  'private_key',
];
