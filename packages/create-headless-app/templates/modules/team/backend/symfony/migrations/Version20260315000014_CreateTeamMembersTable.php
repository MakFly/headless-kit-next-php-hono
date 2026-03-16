<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315000014_CreateTeamMembersTable extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create team_members table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE team_members (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            role VARCHAR(255) NOT NULL DEFAULT \'member\',
            joined_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_team_members_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
            CONSTRAINT FK_team_members_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_team_members_org_user ON team_members (organization_id, user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE team_members');
    }
}
