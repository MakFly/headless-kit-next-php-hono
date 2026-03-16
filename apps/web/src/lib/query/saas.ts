import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { queryKeys } from './keys';
import { getInvoicesAction } from '@/lib/actions/saas/billing';
import {
  getTeamMembersAction,
  changeTeamMemberRoleAction,
  removeTeamMemberAction,
} from '@/lib/actions/saas/team';
import type { TeamRole } from '@/types/saas';

export function useInvoices(orgId: string) {
  return useQuery({
    queryKey: queryKeys.saas.invoices(orgId),
    queryFn: () => getInvoicesAction(orgId),
    enabled: !!orgId,
  });
}

export function useTeamMembers(orgId: string) {
  return useQuery({
    queryKey: queryKeys.saas.team(orgId),
    queryFn: () => getTeamMembersAction(orgId),
    enabled: !!orgId,
  });
}

export function useChangeRole(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ memberId, role }: { memberId: string; role: TeamRole }) =>
      changeTeamMemberRoleAction(orgId, memberId, role),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.team(orgId) }),
  });
}

export function useRemoveMember(orgId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (memberId: string) => removeTeamMemberAction(orgId, memberId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: queryKeys.saas.team(orgId) }),
  });
}
