/**
 * Server Actions for role management (RBAC)
 *
 * These actions use the BFF to communicate with the Laravel API.
 * All routes require admin role.
 */

'use server';

import type { Role, Permission } from '@/types';
import { bffGet, bffPost } from '../_shared/bff-client';
import { unwrapEnvelope } from '../_shared/envelope';

/**
 * Role with permissions
 */
export type RoleWithPermissions = Role & { permissions: Permission[] };

/**
 * Data required to create a new role
 */
export type CreateRoleData = {
  name: string;
  slug: string;
  description?: string;
};

/**
 * Get list of roles with their permissions
 */
export async function getRolesAction(): Promise<RoleWithPermissions[]> {
  const response = await bffGet<unknown>('/api/v1/admin/roles');
  return unwrapEnvelope<RoleWithPermissions[]>(response);
}

/**
 * Create a new role
 */
export async function createRoleAction(data: CreateRoleData): Promise<Role> {
  const response = await bffPost<unknown>('/api/v1/admin/roles', data);
  return unwrapEnvelope<Role>(response);
}

/**
 * Update role permissions
 */
export async function updateRolePermissionsAction(
  roleId: number,
  permissionIds: number[]
): Promise<{ message: string; data: RoleWithPermissions }> {
  const response = await bffPost<{ message: string; data: RoleWithPermissions }>(
    `/api/v1/admin/roles/${roleId}/permissions`,
    { permissions: permissionIds }
  );
  return response;
}
