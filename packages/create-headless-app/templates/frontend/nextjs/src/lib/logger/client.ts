'use client';

import type { Logger, LogContext, LogLevel } from './types';
import { LOG_LEVELS, REDACTED_KEYS } from './types';

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = (isDev ? 'debug' : 'info') as LogLevel;
const minLevel = LOG_LEVELS[logLevel] || LOG_LEVELS.info;

function redactValue(obj: unknown, depth = 0): unknown {
  if (depth > 5) return obj;
  if (obj === null || obj === undefined) return obj;
  if (typeof obj !== 'object') return obj;

  if (Array.isArray(obj)) {
    return obj.map((item) => redactValue(item, depth + 1));
  }

  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj as Record<string, unknown>)) {
    const lowerKey = key.toLowerCase();
    if (REDACTED_KEYS.some((k) => lowerKey.includes(k.toLowerCase()))) {
      result[key] = '[REDACTED]';
    } else if (typeof value === 'object' && value !== null) {
      result[key] = redactValue(value, depth + 1);
    } else {
      result[key] = value;
    }
  }
  return result;
}

class ClientLogger implements Logger {
  private module: string;
  private bindings: LogContext;

  constructor(module: string, bindings: LogContext = {}) {
    this.module = module;
    this.bindings = bindings;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[level] < minLevel) return;

    const mergedContext = { ...this.bindings, ...context };
    const redactedContext = redactValue(mergedContext) as LogContext;

    const prefix = `[${this.module}]`;
    const hasContext = Object.keys(redactedContext).length > 0;

    switch (level) {
      case 'trace':
      case 'debug':
        if (hasContext) {
          console.debug(prefix, message, redactedContext);
        } else {
          console.debug(prefix, message);
        }
        break;
      case 'info':
        if (hasContext) {
          console.info(prefix, message, redactedContext);
        } else {
          console.info(prefix, message);
        }
        break;
      case 'warn':
        if (hasContext) {
          console.warn(prefix, message, redactedContext);
        } else {
          console.warn(prefix, message);
        }
        break;
      case 'error':
      case 'fatal':
        if (hasContext) {
          console.error(prefix, message, redactedContext);
        } else {
          console.error(prefix, message);
        }
        break;
    }
  }

  trace(message: string, context?: LogContext): void {
    this.log('trace', message, context);
  }

  debug(message: string, context?: LogContext): void {
    this.log('debug', message, context);
  }

  info(message: string, context?: LogContext): void {
    this.log('info', message, context);
  }

  warn(message: string, context?: LogContext): void {
    this.log('warn', message, context);
  }

  error(message: string, context?: LogContext): void {
    this.log('error', message, context);
  }

  fatal(message: string, context?: LogContext): void {
    this.log('fatal', message, context);
  }

  child(bindings: LogContext): Logger {
    return new ClientLogger(this.module, { ...this.bindings, ...bindings });
  }
}

export function createClientLogger(module: string): Logger {
  return new ClientLogger(module);
}
