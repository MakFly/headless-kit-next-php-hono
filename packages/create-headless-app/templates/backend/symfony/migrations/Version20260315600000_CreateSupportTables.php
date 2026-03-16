<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315600000_CreateSupportTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create support tables: conversations, messages, canned_responses';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE conversations (
            id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            agent_id VARCHAR(36) DEFAULT NULL,
            subject VARCHAR(255) NOT NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'open\',
            priority VARCHAR(255) NOT NULL DEFAULT \'medium\',
            rating INTEGER DEFAULT NULL,
            last_message_at DATETIME DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_conversations_user FOREIGN KEY (user_id) REFERENCES users (id),
            CONSTRAINT FK_conversations_agent FOREIGN KEY (agent_id) REFERENCES users (id)
        )');
        $this->addSql('CREATE INDEX IDX_conversations_user ON conversations (user_id)');
        $this->addSql('CREATE INDEX IDX_conversations_agent ON conversations (agent_id)');
        $this->addSql('CREATE INDEX IDX_conversations_status ON conversations (status)');

        $this->addSql('CREATE TABLE messages (
            id VARCHAR(36) NOT NULL,
            conversation_id VARCHAR(36) NOT NULL,
            sender_id VARCHAR(36) NOT NULL,
            sender_type VARCHAR(255) NOT NULL DEFAULT \'user\',
            content TEXT NOT NULL,
            created_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_messages_conversation FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX IDX_messages_conversation ON messages (conversation_id)');

        $this->addSql('CREATE TABLE canned_responses (
            id VARCHAR(36) NOT NULL,
            title VARCHAR(255) NOT NULL,
            content TEXT NOT NULL,
            category VARCHAR(255) DEFAULT NULL,
            shortcut VARCHAR(255) DEFAULT NULL,
            created_by VARCHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id)
        )');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE canned_responses');
        $this->addSql('DROP TABLE messages');
        $this->addSql('DROP TABLE conversations');
    }
}
