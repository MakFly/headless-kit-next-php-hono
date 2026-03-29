<?php

declare(strict_types=1);

namespace App\DependencyInjection\Compiler;

use Symfony\Component\DependencyInjection\Compiler\CompilerPassInterface;
use Symfony\Component\DependencyInjection\ContainerBuilder;

/**
 * Compiler pass to dynamically switch storage based on STORAGE_DRIVER env var.
 *
 * When STORAGE_DRIVER=s3, the default storage alias is redirected to s3.storage.
 */
class StorageCompilerPass implements CompilerPassInterface
{
    public function process(ContainerBuilder $container): void
    {
        $driver = $container->getParameter('kernel.environment') === 'prod'
            ? ($_ENV['STORAGE_DRIVER'] ?? 's3')
            : ($_ENV['STORAGE_DRIVER'] ?? 'local');

        if ($driver === 's3') {
            $container->setAlias('flysystem.storage.default.storage', 'flysystem.storage.s3.storage');
        }
    }
}
