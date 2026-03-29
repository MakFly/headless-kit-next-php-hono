<?php

declare(strict_types=1);

namespace App\Shared\ApiPlatform\State;

use ApiPlatform\Metadata\Operation;
use ApiPlatform\State\ProcessorInterface;
use App\Shared\Entity\Conversation;
use App\Shared\Entity\User;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\SecurityBundle\Security;

/**
 * @implements ProcessorInterface<Conversation, Conversation>
 */
final class ConversationProcessor implements ProcessorInterface
{
    public function __construct(
        private readonly EntityManagerInterface $em,
        private readonly Security $security,
    ) {
    }

    /**
     * @param Conversation $data
     */
    public function process(mixed $data, Operation $operation, array $uriVariables = [], array $context = []): Conversation
    {
        $user = $this->security->getUser();
        \assert($user instanceof User);

        $data->setUser($user);
        $data->setStatus('open');

        $this->em->persist($data);
        $this->em->flush();

        return $data;
    }
}
