'use client'

import { EditIcon, EyeIcon, MoreHorizontalIcon, TrashIcon } from 'lucide-react'
import type { ColumnDef } from '@tanstack/react-table'
import type { Permission, Role } from '@/lib/services/rbac-types'
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

export interface RoleWithPermissions extends Role {
  permissions: Array<Permission>
}

interface RolesTableProps {
  roles: Array<Role>
  permissions?: Array<Permission>
}

export const roleColumns: Array<ColumnDef<Role>> = [
  {
    accessorKey: 'name',
    header: 'Role',
  },
  {
    accessorKey: 'slug',
    header: 'Slug',
    cell: ({ row }) => <Badge variant="outline">{row.original.slug}</Badge>,
  },
  {
    accessorKey: 'description',
    header: 'Description',
  },
  {
    accessorKey: 'permissions',
    header: 'Permissions',
    cell: ({ row }) => (
      <Badge variant="secondary">{row.original.permissions?.length || 0}</Badge>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => {
      const role = row.original
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="size-8 p-0">
              <MoreHorizontalIcon className="size-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem onClick={() => console.log('View', role.id)}>
              <EyeIcon className="mr-2 size-4" />
              View
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => console.log('Edit', role.id)}>
              <EditIcon className="mr-2 size-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              className="text-destructive"
              onClick={() => console.log('Delete', role.id)}
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

export function RolesTable({ roles, permissions: _permissions = [] }: RolesTableProps) {
  return (
    <DataTable
      columns={roleColumns}
      data={roles}
      search={{
        enabled: true,
        placeholder: 'Search roles...',
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
        message: 'No roles found',
      }}
    />
  )
}
