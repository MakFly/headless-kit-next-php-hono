<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315200000_AddUsernameToUsers extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Add username column to users table (required by BetterAuth UserProfileTrait)';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('ALTER TABLE users ADD COLUMN username VARCHAR(255) DEFAULT NULL');
    }

    public function down(Schema $schema): void
    {
        // SQLite doesn't support DROP COLUMN easily, so we skip
    }
}
