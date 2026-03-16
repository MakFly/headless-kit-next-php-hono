'use client'

import {
  ActivityIcon,
  CalendarIcon,
  HelpCircleIcon,
  KeyIcon,
  Loader2Icon,
  ShieldIcon,
  UserIcon,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'

function CardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-4 w-4 rounded-full" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-8 w-16" />
        <Skeleton className="h-3 w-32" />
      </div>
    </div>
  )
}

function StatsCardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('rounded-lg border bg-card p-6', className)}>
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-20" />
        <Skeleton className="h-4 w-4" />
      </div>
      <div className="mt-4 space-y-2">
        <Skeleton className="h-9 w-12" />
        <Skeleton className="h-3 w-24" />
      </div>
    </div>
  )
}

function TableRowSkeleton({
  columns = 4,
  className,
}: {
  columns?: number
  className?: string
}) {
  return (
    <tr className={cn('border-b', className)}>
      {Array.from({ length: columns }).map((_, i) => (
        <td key={i} className="p-4">
          <Skeleton className="h-4 w-full max-w-[200px]" />
        </td>
      ))}
    </tr>
  )
}

function TableSkeleton({
  rows = 5,
  columns = 4,
  className,
}: {
  rows?: number
  columns?: number
  className?: string
}) {
  return (
    <div className={cn('rounded-md border', className)}>
      <table className="w-full">
        <thead>
          <tr className="border-b bg-muted/50">
            {Array.from({ length: columns }).map((_, i) => (
              <th key={i} className="p-4 text-left">
                <Skeleton className="h-4 w-20" />
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <TableRowSkeleton key={i} columns={columns} />
          ))}
        </tbody>
      </table>
    </div>
  )
}

function FormSkeleton({
  fields = 3,
  className,
}: {
  fields?: number
  className?: string
}) {
  return (
    <div className={cn('space-y-4', className)}>
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <Skeleton className="h-4 w-16" />
          <Skeleton className="h-10 w-full" />
        </div>
      ))}
    </div>
  )
}

function ProfileSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-4', className)}>
      <Skeleton className="h-12 w-12 rounded-full" />
      <div className="space-y-2">
        <Skeleton className="h-4 w-32" />
        <Skeleton className="h-3 w-48" />
      </div>
    </div>
  )
}

function ListItemSkeleton({ className }: { className?: string }) {
  return (
    <div
      className={cn('flex items-center gap-3 rounded-lg border p-3', className)}
    >
      <Skeleton className="h-5 w-5" />
      <div className="space-y-1">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
    </div>
  )
}

function DashboardSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Static header - only the user name is dynamic */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Welcome back, <Skeleton className="inline-block h-4 w-24 align-middle" />
        </p>
      </div>

      {/* 4 metric cards: static labels + icons, dynamic values */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profile</CardTitle>
            <UserIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-28 mb-1" />
            <Skeleton className="h-3 w-36" />
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <ShieldIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-8 mb-1" />
            <div className="mt-1 flex flex-wrap gap-1">
              <Skeleton className="h-5 w-14 rounded-full" />
              <Skeleton className="h-5 w-16 rounded-full" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Permissions</CardTitle>
            <KeyIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-8 mb-1" />
            <p className="text-xs text-muted-foreground">Active permissions</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Account Age</CardTitle>
            <CalendarIcon className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Skeleton className="h-7 w-10 mb-1" />
            <p className="text-xs text-muted-foreground">days</p>
          </CardContent>
        </Card>
      </div>

      {/* Bottom 2 cards: static titles, dynamic content */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Your Roles</CardTitle>
            <CardDescription>Assigned roles and their permissions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <ShieldIcon className="size-5 text-[var(--neon)]" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-20" />
                  <Skeleton className="h-3 w-14" />
                </div>
              </div>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <ShieldIcon className="size-5 text-[var(--neon)]" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-3 w-16" />
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <ActivityIcon className="size-5" />
                <p className="text-sm font-medium">View Activity Log</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function SettingsSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Static page header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Manage your account settings.</p>
      </div>

      <div className="space-y-6">
        {/* Profile card: static labels, dynamic input values */}
        <Card>
          <CardHeader>
            <CardTitle>Profile</CardTitle>
            <CardDescription>Update your personal information.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Name</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Label>Email</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-28 rounded-md" />
          </CardContent>
        </Card>

        {/* Security card: static labels, empty inputs (no dynamic data) */}
        <Card>
          <CardHeader>
            <CardTitle>Security</CardTitle>
            <CardDescription>Update your password.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Current Password</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Label>New Password</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <div className="space-y-2">
              <Label>Confirm New Password</Label>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
            <Skeleton className="h-10 w-36 rounded-md" />
          </CardContent>
        </Card>

        {/* Danger zone: fully static */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="text-destructive">Danger Zone</CardTitle>
            <CardDescription>Irreversible actions.</CardDescription>
          </CardHeader>
          <CardContent>
            <Skeleton className="h-10 w-32 rounded-md" />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

function UsersPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Users</h2>
        <p className="text-muted-foreground">Manage user accounts and roles.</p>
      </div>
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}

function RolesPageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Roles</h2>
        <p className="text-muted-foreground">Manage roles and permissions.</p>
      </div>
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}

function HelpSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('flex flex-col gap-6', className)}>
      {/* Static page header */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Aide</h2>
        <p className="text-muted-foreground">
          Guide d'utilisation et documentation technique
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Skeleton Loading doc card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <HelpCircleIcon className="size-5" />
              Skeleton Loading
            </CardTitle>
            <CardDescription>
              Comment afficher des indicateurs de chargement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Composants disponibles</h4>
              <div className="flex flex-wrap gap-2 mb-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <Skeleton key={i} className="h-6 w-28 rounded-full" />
                ))}
              </div>
            </div>
            <Skeleton className="h-36 w-full rounded-md" />
            <Skeleton className="h-36 w-full rounded-md" />
          </CardContent>
        </Card>

        {/* Preview card */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Loader2Icon className="size-5" />
              Preview des Skeletons
            </CardTitle>
            <CardDescription>
              Aperçu en direct des composants de chargement
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-2 text-sm">Stats Cards</h4>
              <div className="grid grid-cols-2 gap-4">
                <StatsCardSkeleton />
                <StatsCardSkeleton />
              </div>
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">Table</h4>
              <TableSkeleton rows={3} columns={3} />
            </div>
            <div>
              <h4 className="font-medium mb-2 text-sm">Profile</h4>
              <ProfileSkeleton />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Token card skeleton */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Loader2Icon className="size-5" />
            Token d'authentification
          </CardTitle>
          <CardDescription>
            Indicateur de validité du token de session
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-medium mb-2">Indicateur de session</h4>
            <Skeleton className="h-4 w-full max-w-lg mb-4" />
            <Skeleton className="h-10 w-40 rounded-md" />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function PageSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('space-y-6', className)}>
      <div className="space-y-2">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-4 w-64" />
      </div>
      <TableSkeleton rows={5} columns={4} />
    </div>
  )
}

export {
  CardSkeleton,
  StatsCardSkeleton,
  TableRowSkeleton,
  TableSkeleton,
  FormSkeleton,
  ProfileSkeleton,
  ListItemSkeleton,
  DashboardSkeleton,
  SettingsSkeleton,
  UsersPageSkeleton,
  RolesPageSkeleton,
  HelpSkeleton,
  PageSkeleton,
}
