/**
 * Server Actions for user management (RBAC)
 */

'use server';

import type { User, Role, Permission } from '@/types';
import { bffGet, bffPost, bffDelete } from '../_shared/bff-client';

export type UserWithRoles = User & { roles: Role[] };

export type UserWithRolesAndPermissions = User & {
  roles: Role[];
  permissions: Permission[];
};

export async function getUsersAction(): Promise<UserWithRoles[]> {
  const response = await bffGet<{ data: UserWithRoles[] }>('/api/v1/users');
  return response.data;
}

export async function getUserAction(
  userId: number
): Promise<UserWithRolesAndPermissions> {
  const response = await bffGet<{ data: UserWithRolesAndPermissions }>(
    `/api/v1/admin/users/${userId}`
  );
  return response.data;
}

export async function assignRoleAction(
  userId: number,
  roleSlug: string
): Promise<{ message: string; data: UserWithRoles }> {
  const response = await bffPost<{
    message: string;
    data: UserWithRoles;
  }>(`/api/v1/admin/users/${userId}/roles`, { role: roleSlug });
  return response;
}

export async function removeRoleAction(
  userId: number,
  roleId: number
): Promise<{ message: string }> {
  const response = await bffDelete<{ message: string }>(
    `/api/v1/admin/users/${userId}/roles/${roleId}`
  );
  return response;
}
