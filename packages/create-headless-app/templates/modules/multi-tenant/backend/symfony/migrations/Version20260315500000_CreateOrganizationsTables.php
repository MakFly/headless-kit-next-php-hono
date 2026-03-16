<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315500000_CreateOrganizationsTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create organizations and team_members tables';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE organizations (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            owner_id VARCHAR(36) NOT NULL,
            plan_id VARCHAR(36) DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_organizations_owner FOREIGN KEY (owner_id) REFERENCES users (id),
            CONSTRAINT FK_organizations_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_organizations_slug ON organizations (slug)');
        $this->addSql('CREATE INDEX IDX_organizations_owner ON organizations (owner_id)');

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
        $this->addSql('CREATE INDEX IDX_team_members_org ON team_members (organization_id)');
        $this->addSql('CREATE INDEX IDX_team_members_user ON team_members (user_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE team_members');
        $this->addSql('DROP TABLE organizations');
    }
}
