import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getCurrentUserAction } from '@/lib/actions/auth';
import { getUsersAction, getRolesAction } from '@/lib/actions/rbac';
import { SiteHeaderServer } from '@/components/site-header-server';
import { UsersDataTable } from '@/components/dashboard/users-data-table';
import { isAdmin } from '@/types';

/**
 * Users Management Page - SSR
 *
 * Accessible uniquement aux admins
 */
export default async function UsersPage() {
  const user = await getCurrentUserAction();

  if (!user) {
    redirect('/dashboard/auth/login');
  }

  // Vérifier les permissions admin
  if (!isAdmin(user)) {
    redirect('/dashboard');
  }

  // Récupérer les données en parallèle
  let users = null;
  let roles = null;
  let error = null;

  try {
    [users, roles] = await Promise.all([getUsersAction(), getRolesAction()]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load data';
  }

  // DEBUG
  console.log('[USERS PAGE]', {
    userRoles: user.roles,
    isAdmin: isAdmin(user),
    usersCount: users?.length || 0,
    rolesCount: roles?.length || 0,
    error,
  });

  return (
    <>
      <SiteHeaderServer
        title="Users Management"
        subtitle="Manage user accounts and role assignments"
        user={user}
      />
      <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8">
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
            <p className="font-medium">Error loading users</p>
            <p className="text-sm">{error}</p>
          </div>
        ) : (
          <UsersDataTable
            users={users || []}
            roles={roles || []}
          />
        )}
      </div>
    </>
  );
}
