<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315500000_CreateSaasTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create SaaS tables: plans, organizations, team_members, subscriptions, invoices, usage_records';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE plans (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            price_monthly INTEGER NOT NULL,
            price_yearly INTEGER NOT NULL,
            features JSON NOT NULL,
            limits JSON NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_plans_slug ON plans (slug)');

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

        $this->addSql('CREATE TABLE subscriptions (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            plan_id VARCHAR(36) NOT NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'active\',
            current_period_start DATETIME NOT NULL,
            current_period_end DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_subscriptions_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE,
            CONSTRAINT FK_subscriptions_plan FOREIGN KEY (plan_id) REFERENCES plans (id)
        )');

        $this->addSql('CREATE TABLE invoices (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            amount INTEGER NOT NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'pending\',
            period_start DATETIME NOT NULL,
            period_end DATETIME NOT NULL,
            paid_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_invoices_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
        )');

        $this->addSql('CREATE TABLE usage_records (
            id VARCHAR(36) NOT NULL,
            organization_id VARCHAR(36) NOT NULL,
            metric VARCHAR(255) NOT NULL,
            value INTEGER NOT NULL,
            limit_value INTEGER NOT NULL,
            recorded_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_usage_records_org FOREIGN KEY (organization_id) REFERENCES organizations (id) ON DELETE CASCADE
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE usage_records');
        $this->addSql('DROP TABLE invoices');
        $this->addSql('DROP TABLE subscriptions');
        $this->addSql('DROP TABLE team_members');
        $this->addSql('DROP TABLE organizations');
        $this->addSql('DROP TABLE plans');
    }
}
