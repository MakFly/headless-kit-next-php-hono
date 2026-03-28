import type { Logger, LogContext, LogLevel } from './types';
import { LOG_LEVELS, REDACTED_KEYS } from './types';

const logLevel = (process.env.LOG_LEVEL || 'info') as LogLevel;
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

function formatLog(
  level: LogLevel,
  module: string,
  message: string,
  context?: LogContext
): string {
  const redacted = context ? (redactValue(context) as LogContext) : {};
  const entry = {
    level,
    time: new Date().toISOString(),
    module,
    msg: message,
    ...redacted,
  };
  return JSON.stringify(entry);
}

class EdgeLogger implements Logger {
  private module: string;
  private bindings: LogContext;

  constructor(module: string, bindings: LogContext = {}) {
    this.module = module;
    this.bindings = bindings;
  }

  private log(level: LogLevel, message: string, context?: LogContext): void {
    if (LOG_LEVELS[level] < minLevel) return;

    const mergedContext = { ...this.bindings, ...context };
    const output = formatLog(level, this.module, message, mergedContext);

    switch (level) {
      case 'trace':
      case 'debug':
        console.debug(output);
        break;
      case 'info':
        console.info(output);
        break;
      case 'warn':
        console.warn(output);
        break;
      case 'error':
      case 'fatal':
        console.error(output);
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
    return new EdgeLogger(this.module, { ...this.bindings, ...bindings });
  }
}

export function createEdgeLogger(module: string): Logger {
  return new EdgeLogger(module);
}
