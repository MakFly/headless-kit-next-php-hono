<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Permission;
use App\Entity\Role;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Persistence\ObjectManager;

class RbacFixtures extends Fixture
{
    public function load(ObjectManager $manager): void
    {
        // =====================================================================
        // 1. Create Permissions
        // =====================================================================

        $permissionsData = [
            // Users
            ['users', 'create'],
            ['users', 'read'],
            ['users', 'update'],
            ['users', 'delete'],
            ['users', 'manage'],
            // Roles
            ['roles', 'create'],
            ['roles', 'read'],
            ['roles', 'update'],
            ['roles', 'delete'],
            ['roles', 'manage'],
            // Permissions
            ['permissions', 'read'],
            ['permissions', 'manage'],
            // Posts
            ['posts', 'create'],
            ['posts', 'read'],
            ['posts', 'update'],
            ['posts', 'delete'],
            ['posts', 'manage'],
            // Settings
            ['settings', 'read'],
            ['settings', 'update'],
            ['settings', 'manage'],
            // Comments (matching Laravel seeder)
            ['comments', 'create'],
            ['comments', 'read'],
            ['comments', 'update'],
            ['comments', 'delete'],
            ['comments', 'manage'],
        ];

        $permissions = [];
        foreach ($permissionsData as [$resource, $action]) {
            $permission = new Permission();
            $permission->setName(ucfirst($action).' '.ucfirst($resource));
            $permission->setSlug("{$resource}.{$action}");
            $permission->setResource($resource);
            $permission->setAction($action);
            $manager->persist($permission);
            $permissions["{$resource}.{$action}"] = $permission;
        }

        // =====================================================================
        // 2. Create Roles
        // =====================================================================

        $adminRole = new Role();
        $adminRole->setName('Administrator');
        $adminRole->setSlug('admin');
        $adminRole->setDescription('Full system access');

        $moderatorRole = new Role();
        $moderatorRole->setName('Moderator');
        $moderatorRole->setSlug('moderator');
        $moderatorRole->setDescription('Content moderation access');

        $userRole = new Role();
        $userRole->setName('User');
        $userRole->setSlug('user');
        $userRole->setDescription('Standard user access');

        // =====================================================================
        // 3. Assign Permissions to Roles
        // =====================================================================

        // Admin gets ALL permissions
        foreach ($permissions as $permission) {
            $adminRole->addPermission($permission);
        }

        // Moderator permissions
        $moderatorPermissionSlugs = [
            'users.read',
            'users.update',
            'posts.read',
            'posts.create',
            'posts.update',
            'posts.delete',
            'comments.read',
            'comments.update',
            'comments.delete',
        ];
        foreach ($moderatorPermissionSlugs as $slug) {
            if (isset($permissions[$slug])) {
                $moderatorRole->addPermission($permissions[$slug]);
            }
        }

        // User permissions
        $userPermissionSlugs = [
            'posts.read',
            'posts.create',
            'comments.read',
            'comments.create',
        ];
        foreach ($userPermissionSlugs as $slug) {
            if (isset($permissions[$slug])) {
                $userRole->addPermission($permissions[$slug]);
            }
        }

        $manager->persist($adminRole);
        $manager->persist($moderatorRole);
        $manager->persist($userRole);

        // =====================================================================
        // 4. Assign Roles to existing Users
        // =====================================================================

        $manager->flush();

        $userRepo = $manager->getRepository(User::class);

        $roleAssignments = [
            'admin@example.com' => $adminRole,
            'user@example.com' => $userRole,
        ];

        foreach ($roleAssignments as $email => $role) {
            /** @var User|null $user */
            $user = $userRepo->findOneBy(['email' => $email]);
            if ($user !== null) {
                $user->assignRole($role);
                $manager->persist($user);
            }
        }

        $manager->flush();
    }
}
