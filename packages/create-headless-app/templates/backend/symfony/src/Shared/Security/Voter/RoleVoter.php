<?php

declare(strict_types=1);

namespace App\Shared\Security\Voter;

use App\Shared\Entity\User;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Voter that checks if the authenticated user has a specific role.
 *
 * Attribute pattern: ROLE_CHECK_{slug}
 * Example: #[IsGranted('ROLE_CHECK_admin')]
 */
class RoleVoter extends Voter
{
    private const string PREFIX = 'ROLE_CHECK_';

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

        $roleSlug = substr($attribute, strlen(self::PREFIX));

        return $user->hasRole($roleSlug);
    }
}
