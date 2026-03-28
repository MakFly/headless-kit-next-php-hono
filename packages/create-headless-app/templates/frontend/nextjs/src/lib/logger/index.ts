import type { Logger } from './types';

export type { Logger, LogContext, LogLevel, LogEntry } from './types';
export { LOG_LEVELS, REDACTED_KEYS } from './types';

// Re-export server logger pour import direct
export { createServerLogger, basePino } from './server';

// Re-export edge logger pour import direct
export { createEdgeLogger } from './edge';

/**
 * Crée un logger adapté à l'environnement d'exécution.
 *
 * - Server (Node.js): Utilise Pino avec pretty-print en dev
 * - Edge (Middleware): Utilise un logger JSON custom (Pino non supporté)
 * - Client (Browser): Utilise console avec Beacon API pour warn/error
 *
 * @param module - Nom du module pour identifier les logs
 * @returns Logger instance
 *
 * @example
 * ```ts
 * // Server Component ou Route Handler
 * import { createLogger } from '@/lib/logger';
 * const log = createLogger('auth');
 * log.info('User logged in', { userId: 123 });
 * ```
 *
 * @example
 * ```ts
 * // Client Component
 * 'use client';
 * import { createLogger } from '@/lib/logger';
 * const log = createLogger('ui');
 * log.error('Form validation failed', { field: 'email' });
 * // warn/error seront envoyés au serveur via Beacon API
 * ```
 */
export function createLogger(module: string): Logger {
  // Détection d'environnement
  const isClient = typeof window !== 'undefined';
  const isEdge =
    typeof (globalThis as Record<string, unknown>).EdgeRuntime !== 'undefined' ||
    (typeof process !== 'undefined' &&
      process.env.NEXT_RUNTIME === 'edge');

  if (isClient) {
    // Import dynamique pour le client
    const { createClientLogger } = require('./client') as typeof import('./client');
    return createClientLogger(module);
  }

  if (isEdge) {
    // Import dynamique pour Edge
    const { createEdgeLogger } = require('./edge') as typeof import('./edge');
    return createEdgeLogger(module);
  }

  // Server (Node.js)
  const { createServerLogger } = require('./server') as typeof import('./server');
  return createServerLogger(module);
}
