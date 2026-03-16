<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260314000000_CreateRbacTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create RBAC tables: roles, permissions, role_permission, user_roles';
    }

    public function up(Schema $schema): void
    {
        // Roles table
        $this->addSql('CREATE TABLE roles (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            description VARCHAR(500) DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B63E2EC7989D9B62 ON roles (slug)');

        // Permissions table
        $this->addSql('CREATE TABLE permissions (
            id INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            resource VARCHAR(255) NOT NULL,
            action VARCHAR(255) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_2DEDCC6F989D9B62 ON permissions (slug)');

        // Role-Permission pivot table
        $this->addSql('CREATE TABLE role_permission (
            role_id INTEGER NOT NULL,
            permission_id INTEGER NOT NULL,
            PRIMARY KEY (role_id, permission_id),
            CONSTRAINT FK_6F7DF886D60322AC FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE,
            CONSTRAINT FK_6F7DF886FED90CCA FOREIGN KEY (permission_id) REFERENCES permissions (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX IDX_6F7DF886D60322AC ON role_permission (role_id)');
        $this->addSql('CREATE INDEX IDX_6F7DF886FED90CCA ON role_permission (permission_id)');

        // User-Roles pivot table
        $this->addSql('CREATE TABLE user_roles (
            user_id VARCHAR(36) NOT NULL,
            role_id INTEGER NOT NULL,
            PRIMARY KEY (user_id, role_id),
            CONSTRAINT FK_54FCD59FA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CONSTRAINT FK_54FCD59FD60322AC FOREIGN KEY (role_id) REFERENCES roles (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX IDX_54FCD59FA76ED395 ON user_roles (user_id)');
        $this->addSql('CREATE INDEX IDX_54FCD59FD60322AC ON user_roles (role_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE user_roles');
        $this->addSql('DROP TABLE role_permission');
        $this->addSql('DROP TABLE permissions');
        $this->addSql('DROP TABLE roles');
    }
}
