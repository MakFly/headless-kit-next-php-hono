<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpKernel\Exception\AccessDeniedHttpException;

/**
 * @implements ProcessorInterface<TeamMember, TeamMember>
 */
final class TeamMemberProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {
    }

    /**
     * @param TeamMember $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): TeamMember
    {
        $user = $this->security->getUser();
        \assert($user instanceof User);

        // If creating, verify user has access to the org
        $org = $data->getOrganization();
        if ($org->getOwner()->getId() !== $user->getId() && !$this->security->isGranted('ROLE_ADMIN')) {
            // Check if user is admin/owner of the org
            $isOrgAdmin = false;
            foreach ($org->getTeamMembers() as $member) {
                if ($member->getUser()->getId() === $user->getId() && \in_array($member->getRole(), ['owner', 'admin'], true)) {
                    $isOrgAdmin = true;
                    break;
                }
            }
            if (!$isOrgAdmin) {
                throw new AccessDeniedHttpException('You must be an org admin to manage team members.');
            }
        }

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
