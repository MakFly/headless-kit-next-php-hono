/**
 * Server Actions for role management (RBAC)
 */

'use server';

import type { Role, Permission } from '@/types';
import { bffGet, bffPost } from '../_shared/bff-client';

export type RoleWithPermissions = Role & { permissions: Permission[] };

export type CreateRoleData = {
  name: string;
  slug: string;
  description?: string;
};

export async function getRolesAction(): Promise<RoleWithPermissions[]> {
  const response = await bffGet<{ data: RoleWithPermissions[] }>(
    '/api/v1/admin/roles'
  );
  return response.data;
}

export async function createRoleAction(data: CreateRoleData): Promise<Role> {
  const response = await bffPost<{ data: Role }>('/api/v1/admin/roles', data);
  return response.data;
}

export async function updateRolePermissionsAction(
  roleId: number,
  permissionIds: number[]
): Promise<{ message: string; data: RoleWithPermissions }> {
  const response = await bffPost<{
    message: string;
    data: RoleWithPermissions;
  }>(`/api/v1/admin/roles/${roleId}/permissions`, { permissions: permissionIds });
  return response;
}
