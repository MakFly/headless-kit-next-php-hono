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
use Symfony\Component\HttpFoundation\Request;
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
        if (!\in_array($resourceClass, self::SUPPORTED_CLASSES, true)) {
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
        $orgId = $this->resolveOrgId($request);

        if ($orgId === null) {
            // No org context — return empty result
            $queryBuilder->andWhere('1 = 0');

            return;
        }

        $rootAlias = $queryBuilder->getRootAliases()[0];
        $paramName = 'org_scope_ext';

        $queryBuilder
            ->andWhere(\sprintf('%s.organization = :%s', $rootAlias, $paramName))
            ->setParameter($paramName, $orgId);
    }

    /**
     * Resolve orgId from multiple sources (path > query > header).
     * The frontends send orgId in the URL path: /api/v1/saas/orgs/{orgId}/...
     */
    private function resolveOrgId(?Request $request): ?string
    {
        if ($request === null) {
            return null;
        }

        // 1. Route attribute (set by controllers via path param)
        $orgId = $request->attributes->get('orgId');
        if ($orgId !== null) {
            return (string) $orgId;
        }

        // 2. Extract from URL path: /api/v1/saas/orgs/{uuid}/...
        $path = $request->getPathInfo();
        if (preg_match('#/orgs/([a-f0-9-]{36})(?:/|$)#i', $path, $matches)) {
            return $matches[1];
        }

        // 3. Query param fallback
        $orgId = $request->query->get('orgId');
        if ($orgId !== null) {
            return (string) $orgId;
        }

        // 4. Header fallback (legacy)
        return $request->headers->get('X-Org-Id');
    }
}
