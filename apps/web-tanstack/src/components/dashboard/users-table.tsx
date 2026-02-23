'use client'

import { ColumnDef } from '@tanstack/react-table'
import { DataTable } from '@/components/ui/data-table'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'
import { MoreHorizontalIcon, EyeIcon, EditIcon, TrashIcon } from 'lucide-react'
import type { User, Role } from '@/lib/services/rbac-types'

interface UsersTableProps {
  users: User[]
  roles?: Role[]
}

export const userColumns: ColumnDef<User>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
  },
  {
    accessorKey: 'email',
    header: 'Email',
  },
  {
    accessorKey: 'roles',
    header: 'Roles',
    cell: ({ row }) => (
      <div className="flex gap-1 flex-wrap">
        {row.original.roles?.map((role) => (
          <Badge
            key={role.id || role.slug}
            variant="secondary"
            className="text-xs"
          >
            {role.name || role.slug}
          </Badge>
        ))}
      </div>
    ),
  },
  {
    accessorKey: 'createdAt',
    header: 'Created',
    cell: ({ row }) => {
      const date = row.original.createdAt
      return date ? new Date(date).toLocaleDateString() : '-'
    },
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const user = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('View', user.id)}>
              <EyeIcon className="mr-2 size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', user.id)}>
              <EditIcon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => console.log('Delete', user.id)}
            >
              <TrashIcon className="mr-2 size-4" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    },
  },
]

export function UsersTable({ users, roles: _roles = [] }: UsersTableProps) {
  return (
    <DataTable
      columns={userColumns}
      data={users}
      search={{
        enabled: true,
        placeholder: 'Search users...',
      }}
      pagination={{
        enabled: true,
        pageSize: 5,
        pageSizeOptions: [5, 10, 25, 50],
      }}
      sort={{
        enabled: true,
      }}
      columnVisibilityConfig={{
        enabled: true,
      }}
      emptyState={{
        message: 'No users found',
      }}
    />
  )
}
