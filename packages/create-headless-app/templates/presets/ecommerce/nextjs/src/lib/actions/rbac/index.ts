// Users
export {
  getUsersAction,
  getUserAction,
  assignRoleAction,
  removeRoleAction,
} from './users';

export type { UserWithRoles, UserWithRolesAndPermissions } from './users';

// Roles
export {
  getRolesAction,
  createRoleAction,
  updateRolePermissionsAction,
} from './roles';

export type { RoleWithPermissions, CreateRoleData } from './roles';

// Permissions
export { getPermissionsAction } from './permissions';

// Re-export error class for RBAC domain
export { RbacActionError } from '../_shared/errors';
