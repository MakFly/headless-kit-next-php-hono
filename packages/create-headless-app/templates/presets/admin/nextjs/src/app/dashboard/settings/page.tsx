'use client';

import { useAuthStore } from '@/stores/auth-store';
import { SiteHeaderClient } from '@/components/site-header-client';
import { redirect } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import {
  UserIcon,
  ShieldIcon,
  KeyIcon,
  MailIcon,
  CalendarIcon,
  AlertTriangleIcon,
} from 'lucide-react';

export default function SettingsPage() {
  const { user, isHydrated, logout } = useAuthStore();

  if (!isHydrated) {
    return (
      <>
        <div className="flex h-16 items-center gap-2 border-b px-4">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-4 w-32" />
        </div>
        <div className="p-6 space-y-6">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </>
    );
  }

  if (!user) {
    redirect('/auth/login');
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <>
      <SiteHeaderClient
        title="Settings"
        subtitle="Manage your account settings"
      />
      <div className="flex flex-1 flex-col gap-6 p-4 pt-6 md:p-8 max-w-3xl">
        {/* Profile Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <UserIcon className="h-5 w-5" />
              Profile
            </CardTitle>
            <CardDescription>Your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-white text-lg font-semibold">
                  {getInitials(user.name)}
                </AvatarFallback>
              </Avatar>
              <div className="space-y-1">
                <h3 className="text-lg font-semibold">{user.name}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <MailIcon className="h-4 w-4" />
                  {user.email}
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <CalendarIcon className="h-4 w-4" />
                  Joined {new Date(user.created_at).toLocaleDateString()}
                </div>
              </div>
            </div>

            <Separator />

            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <ShieldIcon className="h-4 w-4" />
                Roles
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.roles.map((role) => (
                  <Badge key={role.id} variant="secondary">
                    {role.name}
                  </Badge>
                ))}
                {user.roles.length === 0 && (
                  <span className="text-sm text-muted-foreground">No roles assigned</span>
                )}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium flex items-center gap-2">
                <KeyIcon className="h-4 w-4" />
                Permissions
              </h4>
              <div className="flex flex-wrap gap-2">
                {user.permissions.map((perm) => (
                  <Badge key={perm.id} variant="outline" className="text-xs">
                    {perm.name}
                  </Badge>
                ))}
                {user.permissions.length === 0 && (
                  <span className="text-sm text-muted-foreground">No permissions</span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <KeyIcon className="h-5 w-5" />
              Security
            </CardTitle>
            <CardDescription>Manage your security settings</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Email verification</p>
                <p className="text-xs text-muted-foreground">
                  {user.email_verified_at
                    ? `Verified on ${new Date(user.email_verified_at).toLocaleDateString()}`
                    : 'Not verified'}
                </p>
              </div>
              <Badge variant={user.email_verified_at ? 'default' : 'destructive'}>
                {user.email_verified_at ? 'Verified' : 'Unverified'}
              </Badge>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border">
              <div>
                <p className="font-medium text-sm">Password</p>
                <p className="text-xs text-muted-foreground">Change your password</p>
              </div>
              <Button variant="outline" size="sm">
                Change
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Danger Zone */}
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <AlertTriangleIcon className="h-5 w-5" />
              Danger Zone
            </CardTitle>
            <CardDescription>Irreversible actions</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="font-medium text-sm">Sign out</p>
                <p className="text-xs text-muted-foreground">Sign out of your account</p>
              </div>
              <Button variant="destructive" size="sm" onClick={logout}>
                Sign out
              </Button>
            </div>
            <div className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5">
              <div>
                <p className="font-medium text-sm">Delete account</p>
                <p className="text-xs text-muted-foreground">
                  Permanently delete your account and all data
                </p>
              </div>
              <Button variant="destructive" size="sm" disabled>
                Delete
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
