<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315300000_CreateReviewsTable extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create reviews table';
    }

    public function up(Schema $schema): void
    {
        $this->addSql('CREATE TABLE reviews (
            id VARCHAR(36) NOT NULL,
            product_id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            rating INTEGER NOT NULL,
            title VARCHAR(255) DEFAULT NULL,
            comment TEXT DEFAULT NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'pending\',
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY(id),
            CONSTRAINT FK_reviews_product FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE CASCADE,
            CONSTRAINT FK_reviews_user FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )');

        $this->addSql('CREATE INDEX IDX_reviews_product ON reviews (product_id)');
        $this->addSql('CREATE INDEX IDX_reviews_user ON reviews (user_id)');
        $this->addSql('CREATE INDEX IDX_reviews_status ON reviews (status)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE reviews');
    }
}
