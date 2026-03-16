/**
 * Server Actions for permission management (RBAC)
 */

'use server';

import type { Permission } from '@/types';
import { bffGet } from '../_shared/bff-client';

export async function getPermissionsAction(): Promise<Permission[]> {
  const response = await bffGet<{ data: Permission[] }>('/api/v1/admin/permissions');
  return response.data;
}
