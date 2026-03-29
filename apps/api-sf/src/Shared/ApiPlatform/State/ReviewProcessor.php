<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Shared\Entity\Review;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Review, Review>
 */
final class ReviewProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {
    }

    /**
     * @param Review $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Review
    {
        $user = $this->security->getUser();
        \assert($user instanceof User);

        $data->setUser($user);
        $data->setStatus('pending');

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
