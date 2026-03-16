<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Product;
use App\Entity\Review;
use App\Entity\Segment;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;
use Ramsey\Uuid\Uuid;

class AdminFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['admin'];
    }

    public function load(ObjectManager $manager): void
    {
        $customers = $this->createCustomers($manager);
        $this->createSegments($manager);
        $this->createReviews($manager, $customers);
        $manager->flush();
    }

    /**
     * @return User[]
     */
    private function createCustomers(ObjectManager $manager): array
    {
        $customersData = [
            ['email' => 'alice@example.com', 'username' => 'alice_wonder'],
            ['email' => 'bob@example.com', 'username' => 'bob_builder'],
            ['email' => 'charlie@example.com', 'username' => 'charlie_brown'],
            ['email' => 'diana@example.com', 'username' => 'diana_prince'],
            ['email' => 'eve@example.com', 'username' => 'eve_online'],
            ['email' => 'frank@example.com', 'username' => 'frank_castle'],
            ['email' => 'grace@example.com', 'username' => 'grace_hopper'],
            ['email' => 'henry@example.com', 'username' => 'henry_ford'],
            ['email' => 'irene@example.com', 'username' => 'irene_adler'],
            ['email' => 'jack@example.com', 'username' => 'jack_sparrow'],
            ['email' => 'kate@example.com', 'username' => 'kate_bishop'],
            ['email' => 'leo@example.com', 'username' => 'leo_messi'],
            ['email' => 'maria@example.com', 'username' => 'maria_garcia'],
            ['email' => 'noah@example.com', 'username' => 'noah_ark'],
            ['email' => 'olivia@example.com', 'username' => 'olivia_pope'],
        ];

        $customers = [];
        foreach ($customersData as $data) {
            $user = new User();
            $user->setId(Uuid::uuid7()->toString());
            $user->setEmail($data['email']);
            $user->setUsername($data['username']);
            $user->setPassword(password_hash('Customer123!', \PASSWORD_BCRYPT, ['cost' => 4]));
            $user->setCreatedAt(new \DateTimeImmutable());
            $user->setUpdatedAt(new \DateTimeImmutable());
            $manager->persist($user);
            $customers[] = $user;
        }

        return $customers;
    }

    private function createSegments(ObjectManager $manager): void
    {
        $segmentsData = [
            [
                'name' => 'Compulsive Buyers',
                'slug' => 'compulsive',
                'description' => 'Customers who place orders very frequently (5+ orders)',
                'criteria' => ['min_orders' => 5],
            ],
            [
                'name' => 'Regular Customers',
                'slug' => 'regular',
                'description' => 'Customers with 2 to 4 orders',
                'criteria' => ['min_orders' => 2, 'max_orders' => 4],
            ],
            [
                'name' => 'Ordered Once',
                'slug' => 'ordered-once',
                'description' => 'Customers who placed exactly one order',
                'criteria' => ['min_orders' => 1, 'max_orders' => 1],
            ],
            [
                'name' => 'Collectors',
                'slug' => 'collectors',
                'description' => 'Customers who buy from 3 or more different categories',
                'criteria' => ['min_unique_categories' => 3],
            ],
        ];

        foreach ($segmentsData as $data) {
            $segment = new Segment();
            $segment->setName($data['name']);
            $segment->setSlug($data['slug']);
            $segment->setDescription($data['description']);
            $segment->setCriteria($data['criteria']);
            $manager->persist($segment);
        }
    }

    /**
     * @param User[] $customers
     */
    private function createReviews(ObjectManager $manager, array $customers): void
    {
        $products = $manager->getRepository(Product::class)->findAll();
        if (empty($products)) {
            return;
        }

        $reviewsData = [
            ['rating' => 5, 'title' => 'Absolutely amazing!', 'comment' => 'Best purchase I have ever made. Highly recommended.', 'status' => 'approved'],
            ['rating' => 4, 'title' => 'Great quality', 'comment' => 'Very good product, minor packaging issue but overall satisfied.', 'status' => 'approved'],
            ['rating' => 3, 'title' => 'Decent product', 'comment' => 'Does what it says. Nothing extraordinary but works fine.', 'status' => 'approved'],
            ['rating' => 5, 'title' => 'Love it!', 'comment' => 'Exceeded my expectations. Will buy again.', 'status' => 'approved'],
            ['rating' => 2, 'title' => 'Not great', 'comment' => 'Product arrived damaged. Customer service was slow to respond.', 'status' => 'approved'],
            ['rating' => 1, 'title' => 'Terrible', 'comment' => 'Complete waste of money. Does not work as advertised.', 'status' => 'pending'],
            ['rating' => 4, 'title' => 'Solid choice', 'comment' => 'Good value for money. Would recommend to friends.', 'status' => 'pending'],
            ['rating' => 5, 'title' => 'Perfect!', 'comment' => 'Exactly what I needed. Fast shipping too.', 'status' => 'pending'],
            ['rating' => 3, 'title' => 'Average', 'comment' => 'It is okay. Expected a bit more for the price.', 'status' => 'pending'],
            ['rating' => 4, 'title' => 'Very nice', 'comment' => 'Good build quality and looks great. Minor scuff on arrival.', 'status' => 'pending'],
            ['rating' => 1, 'title' => 'Do not buy', 'comment' => 'Broke after two days. Returning it.', 'status' => 'rejected'],
            ['rating' => 2, 'title' => 'Disappointing', 'comment' => 'Quality is much worse than the photos suggest.', 'status' => 'rejected'],
            ['rating' => 5, 'title' => 'Outstanding', 'comment' => 'Premium quality at an affordable price. Cannot believe the value.', 'status' => 'approved'],
            ['rating' => 4, 'title' => 'Happy customer', 'comment' => 'Works as expected. Simple and effective.', 'status' => 'approved'],
            ['rating' => 3, 'title' => 'Could be better', 'comment' => 'Instructions were confusing but the product itself is fine.', 'status' => 'pending'],
            ['rating' => 5, 'title' => 'Best in class', 'comment' => 'Compared several options and this one wins hands down.', 'status' => 'approved'],
            ['rating' => 2, 'title' => 'Meh', 'comment' => 'Not bad but not good either. Feels cheap.', 'status' => 'rejected'],
            ['rating' => 4, 'title' => 'Would buy again', 'comment' => 'Great product with fast delivery. Minor delay but no issues.', 'status' => 'approved'],
            ['rating' => 1, 'title' => 'Scam alert', 'comment' => 'Product does not match the description at all.', 'status' => 'rejected'],
            ['rating' => 5, 'title' => 'Incredible value', 'comment' => 'I bought this on sale and it is worth every penny even at full price.', 'status' => 'pending'],
        ];

        $productCount = count($products);
        $customerCount = count($customers);

        foreach ($reviewsData as $i => $data) {
            $review = new Review();
            $review->setProduct($products[$i % $productCount]);
            $review->setUser($customers[$i % $customerCount]);
            $review->setRating($data['rating']);
            $review->setTitle($data['title']);
            $review->setComment($data['comment']);
            $review->setStatus($data['status']);
            $manager->persist($review);
        }
    }
}
