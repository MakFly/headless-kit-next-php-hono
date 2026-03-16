<?php

declare(strict_types=1);

namespace App\Shared\Security;

use App\Shared\Entity\Organization;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Component\Security\Core\Authentication\Token\TokenInterface;
use Symfony\Component\Security\Core\Authorization\Voter\Vote;
use Symfony\Component\Security\Core\Authorization\Voter\Voter;

/**
 * Voter for organization-scoped RBAC.
 *
 * Role hierarchy: owner > admin > member > viewer
 */
class OrgVoter extends Voter
{
    public const ORG_VIEW = 'ORG_VIEW';
    public const ORG_MEMBER = 'ORG_MEMBER';
    public const ORG_ADMIN = 'ORG_ADMIN';
    public const ORG_OWNER = 'ORG_OWNER';

    /** Minimum role required for each attribute (lower index = lower privilege). */
    private const ROLE_HIERARCHY = ['viewer', 'member', 'admin', 'owner'];

    private const ATTRIBUTE_MIN_ROLE = [
        self::ORG_VIEW => 'viewer',
        self::ORG_MEMBER => 'member',
        self::ORG_ADMIN => 'admin',
        self::ORG_OWNER => 'owner',
    ];

    public function __construct(
        private readonly EntityManagerInterface $em,
    ) {
    }

    protected function supports(string $attribute, mixed $subject): bool
    {
        return isset(self::ATTRIBUTE_MIN_ROLE[$attribute])
            && $subject instanceof Organization;
    }

    protected function voteOnAttribute(string $attribute, mixed $subject, TokenInterface $token, ?Vote $vote = null): bool
    {
        $user = $token->getUser();
        if (!$user instanceof User) {
            return false;
        }

        /** @var Organization $org */
        $org = $subject;

        $teamMember = $this->em->getRepository(TeamMember::class)->findOneBy([
            'organization' => $org,
            'user' => $user,
        ]);

        if (!$teamMember) {
            return false;
        }

        $userRole = $teamMember->getRole();
        $requiredRole = self::ATTRIBUTE_MIN_ROLE[$attribute];

        $userLevel = array_search($userRole, self::ROLE_HIERARCHY, true);
        $requiredLevel = array_search($requiredRole, self::ROLE_HIERARCHY, true);

        if ($userLevel === false || $requiredLevel === false) {
            return false;
        }

        return $userLevel >= $requiredLevel;
    }
}
