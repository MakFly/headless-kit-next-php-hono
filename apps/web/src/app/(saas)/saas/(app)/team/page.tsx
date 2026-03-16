'use client';

import { useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { TeamDataTable } from '@/components/saas/team-data-table';
import { OrgRbacGuard } from '@/components/saas/org-rbac-guard';
import { WithQuery } from '@/lib/query';
import { useTeamMembers, useChangeRole, useRemoveMember } from '@/lib/query/saas';
import { inviteTeamMemberAction } from '@/lib/actions/saas/team';
import { queryKeys } from '@/lib/query';
import { useQueryClient } from '@tanstack/react-query';
import { useOrgStore } from '@/stores/org-store';
import type { TeamRole } from '@/types/saas';
import { PlusIcon } from 'lucide-react';

function TeamSection({ orgId }: { orgId: string }) {
  const { data: members = [], isLoading } = useTeamMembers(orgId);
  const { mutate: changeRole, isPending: isChangingRole } = useChangeRole(orgId);
  const { mutate: removeMember, isPending: isRemoving } = useRemoveMember(orgId);

  const handleChangeRole = (memberId: string, role: TeamRole) => {
    changeRole({ memberId, role });
  };

  const handleRemove = (memberId: string) => {
    removeMember(memberId);
  };

  return (
    <TeamDataTable
      members={members}
      onChangeRole={handleChangeRole}
      onRemove={handleRemove}
      isLoading={isLoading || isChangingRole || isRemoving}
    />
  );
}

function InviteButton({ orgId }: { orgId: string }) {
  const queryClient = useQueryClient();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<TeamRole>('member');
  const [error, setError] = useState<string | null>(null);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) return;
    setActionLoading(true);
    setError(null);
    try {
      await inviteTeamMemberAction(orgId, inviteEmail.trim(), inviteRole);
      setDialogOpen(false);
      setInviteEmail('');
      setInviteRole('member');
      await queryClient.invalidateQueries({ queryKey: queryKeys.saas.team(orgId) });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to invite member');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button>
          <PlusIcon className="mr-2 h-4 w-4" />
          Invite Member
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
          <DialogDescription>
            Send an invitation to join your team.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          {error && (
            <p className="text-sm text-destructive">{error}</p>
          )}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="colleague@example.com"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="role">Role</Label>
            <Select value={inviteRole} onValueChange={(v) => setInviteRole(v as TeamRole)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="member">Member</SelectItem>
                <SelectItem value="viewer">Viewer</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleInvite} disabled={actionLoading || !inviteEmail.trim()}>
            {actionLoading ? 'Sending...' : 'Send Invite'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default function TeamPage() {
  const { activeOrg } = useOrgStore();
  const orgId = activeOrg?.id ?? '';

  return (
    <>
      <SiteHeader title="Team" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {!orgId ? (
          <Card>
            <CardContent className="p-6 text-center text-muted-foreground">
              No organization selected
            </CardContent>
          </Card>
        ) : (
          <WithQuery>
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">Team Members</h2>
              <OrgRbacGuard minRole="admin">
                <InviteButton orgId={orgId} />
              </OrgRbacGuard>
            </div>
            <TeamSection orgId={orgId} />
          </WithQuery>
        )}
      </div>
    </>
  );
}
