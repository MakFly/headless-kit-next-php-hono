import { TrashIcon } from 'lucide-react'
import type { TeamMember, TeamRole } from '@/types/saas'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type TeamTableProps = {
  members: Array<TeamMember>
  onChangeRole: (memberId: string, role: TeamRole) => void
  onRemove: (memberId: string) => void
  isLoading?: boolean
}

const roleBadgeVariant: Record<TeamRole, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  owner: 'default',
  admin: 'secondary',
  member: 'outline',
  viewer: 'outline',
}

export function TeamTable({ members, onChangeRole, onRemove, isLoading }: TeamTableProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Name</TableHead>
          <TableHead>Email</TableHead>
          <TableHead>Role</TableHead>
          <TableHead>Joined</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {members.map((member) => (
          <TableRow key={member.id}>
            <TableCell className="font-medium">{member.user?.name ?? 'Unknown'}</TableCell>
            <TableCell>{member.user?.email ?? '-'}</TableCell>
            <TableCell>
              {member.role === 'owner' ? (
                <Badge variant={roleBadgeVariant[member.role]}>{member.role}</Badge>
              ) : (
                <Select
                  defaultValue={member.role}
                  onValueChange={(value) => onChangeRole(member.id, value as TeamRole)}
                  disabled={isLoading}
                >
                  <SelectTrigger className="w-[110px]">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">admin</SelectItem>
                    <SelectItem value="member">member</SelectItem>
                    <SelectItem value="viewer">viewer</SelectItem>
                  </SelectContent>
                </Select>
              )}
            </TableCell>
            <TableCell>{new Date(member.joinedAt).toLocaleDateString()}</TableCell>
            <TableCell>
              {member.role !== 'owner' && (
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button variant="ghost" size="icon" disabled={isLoading}>
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>Remove team member?</AlertDialogTitle>
                      <AlertDialogDescription>
                        This will remove {member.user?.name ?? 'this member'} from the team. This action cannot be undone.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>Cancel</AlertDialogCancel>
                      <AlertDialogAction onClick={() => onRemove(member.id)}>
                        Remove
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              )}
            </TableCell>
          </TableRow>
        ))}
        {members.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground">
              No team members found
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  )
}
