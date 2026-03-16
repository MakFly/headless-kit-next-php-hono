<?php

namespace Database\Seeders;

use App\Shared\Models\Permission;
use App\Shared\Models\Role;
use App\Shared\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Str;

class RbacSeeder extends Seeder
{
    public function run(): void
    {
        // Create Roles
        $admin = Role::firstOrCreate(
            ['slug' => 'admin'],
            ['name' => 'Administrator', 'description' => 'Full system access']
        );

        $moderator = Role::firstOrCreate(
            ['slug' => 'moderator'],
            ['name' => 'Moderator', 'description' => 'Content moderation access']
        );

        $user = Role::firstOrCreate(
            ['slug' => 'user'],
            ['name' => 'User', 'description' => 'Standard user access']
        );

        // Create Permissions for resources
        $resources = ['users', 'roles', 'posts', 'comments'];

        foreach ($resources as $resource) {
            Permission::createForResource($resource, ['create', 'read', 'update', 'delete', 'manage']);
        }

        // Assign permissions to Admin (all permissions)
        $admin->permissions()->sync(Permission::all()->pluck('id'));

        // Assign permissions to Moderator
        $moderatorPermissions = Permission::whereIn('resource', ['posts', 'comments'])
            ->whereIn('action', ['read', 'update', 'delete'])
            ->pluck('id');
        $moderatorPermissions = $moderatorPermissions->merge(
            Permission::where('resource', 'users')->where('action', 'read')->pluck('id')
        );
        $moderator->permissions()->sync($moderatorPermissions);

        // Assign permissions to User
        $userPermissions = Permission::whereIn('action', ['read'])
            ->whereIn('resource', ['posts', 'comments'])
            ->pluck('id');
        $userPermissions = $userPermissions->merge(
            Permission::where('resource', 'posts')->where('action', 'create')->pluck('id')
        );
        $userPermissions = $userPermissions->merge(
            Permission::where('resource', 'comments')->where('action', 'create')->pluck('id')
        );
        $user->permissions()->sync($userPermissions);

        // Create Test Users from config
        $testAccounts = config('test-accounts');

        foreach ($testAccounts as $account) {
            $user = User::firstOrCreate(
                ['email' => $account['email']],
                [
                    'id' => Str::uuid()->toString(),
                    'name' => $account['name'],
                    'password' => bcrypt($account['password']),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($account['role']);
        }

        $this->command->info('RBAC seeding completed!');
        $this->command->info('Test users created:');
        $this->command->info('  - admin@example.com / Admin1234! (admin)');
        $this->command->info('  - user@example.com / User1234! (user)');
    }
}
