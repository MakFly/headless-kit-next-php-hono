<?php

declare(strict_types=1);

namespace DoctrineMigrations;

use Doctrine\DBAL\Schema\Schema;
use Doctrine\Migrations\AbstractMigration;

final class Version20260315100000_CreateCartOrderTables extends AbstractMigration
{
    public function getDescription(): string
    {
        return 'Create cart and order tables: carts, cart_items, orders, order_items';
    }

    public function up(Schema $schema): void
    {
        // Carts table
        $this->addSql('CREATE TABLE carts (
            id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_4E004AACA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX IDX_4E004AACA76ED395 ON carts (user_id)');

        // Cart items table
        $this->addSql('CREATE TABLE cart_items (
            id VARCHAR(36) NOT NULL,
            cart_id VARCHAR(36) NOT NULL,
            product_id VARCHAR(36) NOT NULL,
            quantity INTEGER NOT NULL DEFAULT 1,
            created_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_BEF484451AD5CDBF FOREIGN KEY (cart_id) REFERENCES carts (id) ON DELETE CASCADE,
            CONSTRAINT FK_BEF484454584665A FOREIGN KEY (product_id) REFERENCES products (id)
        )');
        $this->addSql('CREATE INDEX IDX_BEF484451AD5CDBF ON cart_items (cart_id)');
        $this->addSql('CREATE INDEX IDX_BEF484454584665A ON cart_items (product_id)');

        // Orders table
        $this->addSql('CREATE TABLE orders (
            id VARCHAR(36) NOT NULL,
            user_id VARCHAR(36) NOT NULL,
            status VARCHAR(255) NOT NULL DEFAULT \'pending\',
            total INTEGER NOT NULL DEFAULT 0,
            shipping_address CLOB NOT NULL DEFAULT \'[]\',
            payment_status VARCHAR(255) NOT NULL DEFAULT \'pending\',
            notes CLOB DEFAULT NULL,
            created_at DATETIME NOT NULL,
            updated_at DATETIME NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_E52FFDEEA76ED395 FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        )');
        $this->addSql('CREATE INDEX IDX_E52FFDEEA76ED395 ON orders (user_id)');

        // Order items table
        $this->addSql('CREATE TABLE order_items (
            id VARCHAR(36) NOT NULL,
            order_id VARCHAR(36) NOT NULL,
            product_id VARCHAR(36) DEFAULT NULL,
            product_name VARCHAR(255) NOT NULL,
            product_price INTEGER NOT NULL,
            quantity INTEGER NOT NULL,
            subtotal INTEGER NOT NULL,
            PRIMARY KEY (id),
            CONSTRAINT FK_62809DB08D9F6D38 FOREIGN KEY (order_id) REFERENCES orders (id) ON DELETE CASCADE,
            CONSTRAINT FK_62809DB04584665A FOREIGN KEY (product_id) REFERENCES products (id) ON DELETE SET NULL
        )');
        $this->addSql('CREATE INDEX IDX_62809DB08D9F6D38 ON order_items (order_id)');
        $this->addSql('CREATE INDEX IDX_62809DB04584665A ON order_items (product_id)');
    }

    public function down(Schema $schema): void
    {
        $this->addSql('DROP TABLE order_items');
        $this->addSql('DROP TABLE orders');
        $this->addSql('DROP TABLE cart_items');
        $this->addSql('DROP TABLE carts');
    }
}
