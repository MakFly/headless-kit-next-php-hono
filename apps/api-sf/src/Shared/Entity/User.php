<?php

declare(strict_types=1);

namespace App\Shared\Entity;

use BetterAuth\Symfony\Model\User as BaseUser;
use BetterAuth\Symfony\Model\UserProfileTrait;
use Doctrine\Common\Collections\ArrayCollection;
use Doctrine\Common\Collections\Collection;
use Doctrine\ORM\Mapping as ORM;

/**
 * User entity with UUID v7 primary key.
 *
 * Extends BetterAuth base User which implements:
 * - UserInterface
 * - PasswordAuthenticatedUserInterface
 *
 * Note: The parent BaseUser has a `$roles` property (array of Symfony security roles like ROLE_USER).
 * Our RBAC roles use a separate `$rbacRoles` property mapped to the `user_roles` join table.
 */
#[ORM\Entity]
#[ORM\Table(name: 'users')]
class User extends BaseUser
{
    use UserProfileTrait;

    #[ORM\Id]
    #[ORM\Column(type: 'string', length: 36)]
    protected string $id;

    /** @var Collection<int, Role> */
    #[ORM\ManyToMany(targetEntity: Role::class, inversedBy: 'users')]
    #[ORM\JoinTable(name: 'user_roles')]
    #[ORM\JoinColumn(name: 'user_id', referencedColumnName: 'id')]
    #[ORM\InverseJoinColumn(name: 'role_id', referencedColumnName: 'id')]
    private Collection $rbacRoles;

    public function __construct()
    {
        parent::__construct();
        $this->rbacRoles = new ArrayCollection();
    }

    public function getId(): string
    {
        return $this->id;
    }

    public function setId(string|int $id): static
    {
        $this->id = (string) $id;

        return $this;
    }

    // =========================================================================
    // RBAC Relations
    // =========================================================================

    /** @return Collection<int, Role> */
    public function getUserRoles(): Collection
    {
        return $this->rbacRoles;
    }

    // =========================================================================
    // RBAC Methods
    // =========================================================================

    public function assignRole(Role $role): static
    {
        if (!$this->rbacRoles->contains($role)) {
            $this->rbacRoles->add($role);
        }

        return $this;
    }

    public function removeRole(Role $role): static
    {
        $this->rbacRoles->removeElement($role);

        return $this;
    }

    public function hasRole(string $slug): bool
    {
        return $this->rbacRoles->exists(
            fn (int $key, Role $role) => $role->getSlug() === $slug
        );
    }

    public function hasAnyRole(array $slugs): bool
    {
        return $this->rbacRoles->exists(
            fn (int $key, Role $role) => \in_array($role->getSlug(), $slugs, true)
        );
    }

    /**
     * Get all permissions from all assigned roles (deduplicated).
     *
     * @return array<Permission>
     */
    public function getAllPermissions(): array
    {
        $permissions = [];
        $seen = [];

        foreach ($this->rbacRoles as $role) {
            foreach ($role->getPermissions() as $permission) {
                $id = $permission->getId();
                if (!isset($seen[$id])) {
                    $seen[$id] = true;
                    $permissions[] = $permission;
                }
            }
        }

        return $permissions;
    }

    /**
     * Check if user has a specific permission by resource and action.
     * The "manage" action acts as a wildcard for any action on that resource.
     */
    public function hasPermission(string $resource, string $action): bool
    {
        foreach ($this->getAllPermissions() as $permission) {
            if ($permission->getResource() === $resource
                && ($permission->getAction() === $action || $permission->getAction() === 'manage')
            ) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has a permission by slug (e.g. "users.read").
     */
    public function hasPermissionSlug(string $slug): bool
    {
        foreach ($this->getAllPermissions() as $permission) {
            if ($permission->getSlug() === $slug) {
                return true;
            }
        }

        return false;
    }

    public function isAdmin(): bool
    {
        return $this->hasRole('admin');
    }
}
