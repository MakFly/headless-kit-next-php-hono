<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315000000_CreateShopTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create shop tables: categories and products';
    }

    public function up(Schema $schema): void
    {
        // Categories table
        $this->addSql('CREATE TABLE categories (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            description CLOB DEFAULT NULL,
            image_url VARCHAR(255) DEFAULT NULL,
            parent_id VARCHAR(36) DEFAULT NULL,
            sort_order INTEGER NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_3AF34668727ACA70 FOREIGN KEY (parent_id) REFERENCES categories (id) ON DELETE SET NULL
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_3AF34668989D9B62 ON categories (slug)');
        $this->addSql('CREATE INDEX IDX_3AF34668727ACA70 ON categories (parent_id)');

        // Products table
        $this->addSql('CREATE TABLE products (
            id VARCHAR(36) NOT NULL,
            name VARCHAR(255) NOT NULL,
            slug VARCHAR(255) NOT NULL,
            description CLOB DEFAULT NULL,
            price INTEGER NOT NULL,
            compare_at_price INTEGER DEFAULT NULL,
            sku VARCHAR(255) DEFAULT NULL,
            stock_quantity INTEGER NOT NULL DEFAULT 0,
            category_id VARCHAR(36) DEFAULT NULL,
            image_url VARCHAR(255) DEFAULT NULL,
            images CLOB NOT NULL DEFAULT \'[]\',
            status VARCHAR(255) NOT NULL DEFAULT \'active\',
            featured BOOLEAN NOT NULL DEFAULT 0,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_B3BA5A5A12469DE2 FOREIGN KEY (category_id) REFERENCES categories (id) ON DELETE SET NULL
        )');
        $this->addSql('CREATE UNIQUE INDEX UNIQ_B3BA5A5A989D9B62 ON products (slug)');
        $this->addSql('CREATE INDEX IDX_B3BA5A5A12469DE2 ON products (category_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE products');
        $this->addSql('DROP TABLE categories');
    }
}
