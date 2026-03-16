<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315400000_CreateSegmentsTable extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create segments table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE segments (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            description TEXT DEFAULT NULL,
            criteria CLOB NOT NULL DEFAULT \'[]\',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');

        $this->addSql('CREATE UNIQUE INDEX UNIQ_segments_slug ON segments (slug)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE segments');
    }
}
