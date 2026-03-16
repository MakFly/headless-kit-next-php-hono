/**
 * Shared utilities for Server Actions
 *
 * @internal This module is for internal use by action modules.
 * External code should import from specific action domains.
 */

'use server';

// BFF Client
export {
  bffRequest,
  bffGet,
  bffPost,
  bffPut,
  bffPatch,
  bffDelete,
} from './bff-client';

// Error classes
export {
  ActionError,
  AuthActionError,
  RbacActionError,
  BffActionError,
  throwActionError,
  throwAuthError,
  throwRbacError,
} from './errors';

// Types
export type {
  PaginatedResponse,
  ApiDataResponse,
  ActionResult,
  BffRequestOptions,
  HttpMethod,
} from './types';

// Envelope helpers
export { unwrapEnvelope, unwrapPaginated } from './envelope';
export type { ApiEnvelope, ApiErrorEnvelope, PaginationMeta, UnwrappedPaginated } from './envelope';
