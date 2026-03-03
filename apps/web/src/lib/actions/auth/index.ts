/**
 * Auth Server Actions
 *
 * Public API for authentication operations.
 *
 * @example
 * ```typescript
 * import { loginAction, getCurrentUserAction } from '@/lib/actions/auth';
 *
 * const result = await loginAction({ email, password });
 * const user = await getCurrentUserAction();
 * ```
 */

// Re-export server actions (these already have 'use server' in actions.ts)
export {
  registerAction,
  loginAction,
  logoutAction,
  refreshTokenAction,
  getCurrentUserAction,
  getOAuthProvidersAction,
  getOAuthUrlAction,
  sendMagicLinkAction,
  AuthActionError,
} from './actions';
