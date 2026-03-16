/**
 * Server Actions for permission management (RBAC)
 *
 * These actions use the BFF to communicate with the Laravel API.
 * All routes require admin role.
 */

'use server';

import type { Permission } from '@/types';
import { bffGet } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';

/**
 * Get list of all permissions
 */
export async function getPermissionsAction(): Promise<Permission[]> {
  const response = await bffGet<unknown>('/api/v1/admin/permissions');
  return unwrapEnvelope<Permission[]>(response);
}
