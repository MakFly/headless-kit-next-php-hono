<?php

namespace Database\Seeders;

use App\Models\Permission;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

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

        // Create Test Users
        $testUsers = [
            [
                'email' => 'admin@example.com',
                'name' => 'Admin User',
                'role' => 'admin',
            ],
            [
                'email' => 'test@test.com',
                'name' => 'Test User',
                'role' => 'user',
            ],
            [
                'email' => 'refresh-test@example.com',
                'name' => 'Refresh Test User',
                'role' => 'user',
            ],
        ];

        foreach ($testUsers as $userData) {
            $user = User::firstOrCreate(
                ['email' => $userData['email']],
                [
                    'name' => $userData['name'],
                    'password' => bcrypt('Admin1234!'),
                    'email_verified_at' => now(),
                ]
            );
            $user->assignRole($userData['role']);
        }

        $this->command->info('RBAC seeding completed!');
        $this->command->info('Test users created (password: "Admin1234!" for all):');
        $this->command->info('  - admin@example.com (admin)');
        $this->command->info('  - test@test.com (user)');
        $this->command->info('  - refresh-test@example.com (user)');
    }
}
