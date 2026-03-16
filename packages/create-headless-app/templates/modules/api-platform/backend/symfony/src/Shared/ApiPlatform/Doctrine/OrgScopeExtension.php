<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\Doctrine;

use ApiPlatform\Doctrine\Orm\Extension\QueryCollectionExtensionInterface;
use ApiPlatform\Doctrine\Orm\Extension\QueryItemExtensionInterface;
use ApiPlatform\Doctrine\Orm\Util\QueryNameGeneratorInterface;
use ApiPlatform\Metadata\Operation;
use App\Shared\Entity\Invoice;
use App\Shared\Entity\Subscription;
use App\Shared\Entity\TeamMember;
use App\Shared\Entity\UsageRecord;
use Doctrine\ORM\QueryBuilder;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;

final class OrgScopeExtension implements QueryCollectionExtensionInterface, QueryItemExtensionInterface
{
    private const SUPPORTED_CLASSES = [
        Invoice::class,
        TeamMember::class,
        UsageRecord::class,
        Subscription::class,
    ];

    public function __construct(
        private readonly Security $security,
        private readonly RequestStack $requestStack,
    ) {
    }

    public function applyToCollection(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    public function applyToItem(
        QueryBuilder $queryBuilder,
        QueryNameGeneratorInterface $queryNameGenerator,
        string $resourceClass,
        array $identifiers,
        ?Operation $operation = null,
        array $context = [],
    ): void {
        $this->addWhere($queryBuilder, $resourceClass);
    }

    private function addWhere(QueryBuilder $queryBuilder, string $resourceClass): void
    {
        if (!in_array($resourceClass, self::SUPPORTED_CLASSES, true)) {
            return;
        }

        $user = $this->security->getUser();
        if ($user === null) {
            return;
        }

        // Admin can see all
        if ($this->security->isGranted('ROLE_ADMIN')) {
            return;
        }

        $request = $this->requestStack->getCurrentRequest();
        $orgId = $request?->headers->get('X-Org-Id') ?? $request?->query->get('orgId');

        if ($orgId === null) {
            // No org context — return empty result
            $queryBuilder->andWhere('1 = 0');
            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $paramName = 'org_scope_ext';

        $queryBuilder
            ->andWhere(sprintf('%s.organization = :%s', $rootAlias, $paramName))
            ->setParameter($paramName, $orgId);
    }
}
