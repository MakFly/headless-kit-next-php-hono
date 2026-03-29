<?php

declare(strict_types=1);

namespace App\Shared\Security\Voter;

use App\Shared\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Voter that checks if the authenticated user has a specific permission.
 *
 * Attribute pattern: PERMISSION_{resource}.{action}
 * Example: #[IsGranted('PERMISSION_users.read')]
 */
class PermissionVoter extends Voter
{
    private const string PREFIX = 'PERMISSION_';

    protected function supports(string $attribute, mixed $subject): bool
    {
        return str_starts_with($attribute, self::PREFIX);
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();

        if (!$user instanceof User) {
            return false;
        }

        $permissionString = substr($attribute, \strlen(self::PREFIX));
        $parts = explode('.', $permissionString, 2);

        if (\count($parts) !== 2) {
            return false;
        }

        [$resource, $action] = $parts;

        return $user->hasPermission($resource, $action);
    }
}
