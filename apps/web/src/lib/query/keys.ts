/**
 * Centralized Query Keys
 *
 * All query keys are defined here to ensure consistency
 * and enable proper cache invalidation.
 *
 * Convention:
 * - Use `as const` for type safety
 * - Group by domain
 * - Functions for parameterized keys
 */

export const queryKeys = {
  // =========================================================================
  // Auth
  // =========================================================================
  auth: {
    all: ['auth'] as const,
    user: () => [...queryKeys.auth.all, 'user'] as const,
    oauthProviders: () => [...queryKeys.auth.all, 'oauth-providers'] as const,
  },

  // =========================================================================
  // Users (RBAC)
  // =========================================================================
  users: {
    all: ['users'] as const,
    lists: () => [...queryKeys.users.all, 'list'] as const,
    list: (filters?: { search?: string }) =>
      [...queryKeys.users.lists(), filters] as const,
    details: () => [...queryKeys.users.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.users.details(), id] as const,
  },

  // =========================================================================
  // Roles (RBAC)
  // =========================================================================
  roles: {
    all: ['roles'] as const,
    lists: () => [...queryKeys.roles.all, 'list'] as const,
    list: () => [...queryKeys.roles.lists()] as const,
    details: () => [...queryKeys.roles.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.roles.details(), id] as const,
  },

  // =========================================================================
  // Permissions (RBAC)
  // =========================================================================
  permissions: {
    all: ['permissions'] as const,
    list: () => [...queryKeys.permissions.all, 'list'] as const,
  },

  // =========================================================================
  // Posts (Demo)
  // =========================================================================
  posts: {
    all: ['posts'] as const,
    lists: () => [...queryKeys.posts.all, 'list'] as const,
    list: (limit?: number) => [...queryKeys.posts.lists(), { limit }] as const,
    details: () => [...queryKeys.posts.all, 'detail'] as const,
    detail: (id: number) => [...queryKeys.posts.details(), id] as const,
    comments: (postId: number) =>
      [...queryKeys.posts.detail(postId), 'comments'] as const,
  },

  // =========================================================================
  // Todos (Demo)
  // =========================================================================
  todos: {
    all: ['todos'] as const,
    lists: () => [...queryKeys.todos.all, 'list'] as const,
    list: (userId?: number) => [...queryKeys.todos.lists(), { userId }] as const,
  },

  // =========================================================================
  // Albums (Demo)
  // =========================================================================
  albums: {
    all: ['albums'] as const,
    lists: () => [...queryKeys.albums.all, 'list'] as const,
    list: (limit?: number) => [...queryKeys.albums.lists(), { limit }] as const,
    photos: (albumId: number) =>
      [...queryKeys.albums.all, albumId, 'photos'] as const,
  },

  // =========================================================================
  // SaaS
  // =========================================================================
  saas: {
    all: ['saas'] as const,
    orgs: () => [...queryKeys.saas.all, 'orgs'] as const,
    org: (orgId: string) => [...queryKeys.saas.all, 'org', orgId] as const,
    subscription: (orgId: string) => [...queryKeys.saas.org(orgId), 'subscription'] as const,
    invoices: (orgId: string) => [...queryKeys.saas.org(orgId), 'invoices'] as const,
    plans: () => [...queryKeys.saas.all, 'plans'] as const,
    team: (orgId: string) => [...queryKeys.saas.org(orgId), 'team'] as const,
    usage: (orgId: string) => [...queryKeys.saas.org(orgId), 'usage'] as const,
    settings: (orgId: string) => [...queryKeys.saas.org(orgId), 'settings'] as const,
    dashboard: (orgId: string) => [...queryKeys.saas.org(orgId), 'dashboard'] as const,
  },
} as const;
