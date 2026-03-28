import pino, { type Logger as PinoLogger } from 'pino';
import type { Logger, LogContext } from './types';
import { REDACTED_KEYS } from './types';

const isDev = process.env.NODE_ENV !== 'production';
const logLevel = process.env.LOG_LEVEL || (isDev ? 'debug' : 'info');

const pinoConfig: pino.LoggerOptions = {
  level: logLevel,
  redact: {
    paths: REDACTED_KEYS.flatMap((key) => [
      key,
      `*.${key}`,
      `*.*.${key}`,
      `context.${key}`,
      `context.*.${key}`,
    ]),
    censor: '[REDACTED]',
  },
  formatters: {
    level: (label) => ({ level: label }),
    bindings: (bindings) => ({
      pid: bindings.pid,
      host: bindings.hostname,
    }),
  },
  timestamp: pino.stdTimeFunctions.isoTime,
};

// Pretty print en dev, JSON en prod
const transport = isDev
  ? {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: 'HH:MM:ss',
        ignore: 'pid,hostname',
        singleLine: false,
      },
    }
  : undefined;

const basePino = pino({
  ...pinoConfig,
  ...(transport && { transport }),
});

class ServerLogger implements Logger {
  private pino: PinoLogger;
  private module: string;

  constructor(module: string, pinoInstance?: PinoLogger) {
    this.module = module;
    this.pino = pinoInstance || basePino.child({ module });
  }

  trace(message: string, context?: LogContext): void {
    this.pino.trace(context || {}, message);
  }

  debug(message: string, context?: LogContext): void {
    this.pino.debug(context || {}, message);
  }

  info(message: string, context?: LogContext): void {
    this.pino.info(context || {}, message);
  }

  warn(message: string, context?: LogContext): void {
    this.pino.warn(context || {}, message);
  }

  error(message: string, context?: LogContext): void {
    this.pino.error(context || {}, message);
  }

  fatal(message: string, context?: LogContext): void {
    this.pino.fatal(context || {}, message);
  }

  child(bindings: LogContext): Logger {
    return new ServerLogger(this.module, this.pino.child(bindings));
  }
}

export function createServerLogger(module: string): Logger {
  return new ServerLogger(module);
}

export { basePino };
