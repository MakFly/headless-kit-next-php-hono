<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Shared\Models\Customer;
use App\Shared\Models\Product;
use App\Shared\Models\Review;
use App\Shared\Models\Segment;
use Illuminate\Database\Seeder;

class AdminShopSeeder extends Seeder
{
    public function run(): void
    {
        // Segments
        $segments = [
            ['name' => 'Compulsive', 'slug' => 'compulsive'],
            ['name' => 'Regular', 'slug' => 'regular'],
            ['name' => 'Ordered Once', 'slug' => 'ordered-once'],
            ['name' => 'Collectors', 'slug' => 'collectors'],
        ];

        foreach ($segments as $seg) {
            Segment::create($seg);
        }

        // Customers (15)
        $customersData = [
            ['first_name' => 'Alice', 'last_name' => 'Martin', 'email' => 'alice.martin@example.com', 'segment' => 'compulsive', 'total_spent' => 245000, 'nb_orders' => 12],
            ['first_name' => 'Bob', 'last_name' => 'Dupont', 'email' => 'bob.dupont@example.com', 'segment' => 'regular', 'total_spent' => 89000, 'nb_orders' => 5],
            ['first_name' => 'Claire', 'last_name' => 'Bernard', 'email' => 'claire.bernard@example.com', 'segment' => 'collectors', 'total_spent' => 320000, 'nb_orders' => 8],
            ['first_name' => 'David', 'last_name' => 'Petit', 'email' => 'david.petit@example.com', 'segment' => 'ordered-once', 'total_spent' => 15000, 'nb_orders' => 1],
            ['first_name' => 'Emma', 'last_name' => 'Leroy', 'email' => 'emma.leroy@example.com', 'segment' => 'regular', 'total_spent' => 67000, 'nb_orders' => 4],
            ['first_name' => 'François', 'last_name' => 'Moreau', 'email' => 'francois.moreau@example.com', 'segment' => 'compulsive', 'total_spent' => 198000, 'nb_orders' => 9],
            ['first_name' => 'Gabrielle', 'last_name' => 'Simon', 'email' => 'gabrielle.simon@example.com', 'segment' => 'collectors', 'total_spent' => 412000, 'nb_orders' => 15],
            ['first_name' => 'Hugo', 'last_name' => 'Laurent', 'email' => 'hugo.laurent@example.com', 'segment' => 'ordered-once', 'total_spent' => 9900, 'nb_orders' => 1],
            ['first_name' => 'Isabelle', 'last_name' => 'Michel', 'email' => 'isabelle.michel@example.com', 'segment' => 'regular', 'total_spent' => 55000, 'nb_orders' => 3],
            ['first_name' => 'Julien', 'last_name' => 'Lefebvre', 'email' => 'julien.lefebvre@example.com', 'segment' => 'compulsive', 'total_spent' => 175000, 'nb_orders' => 11],
            ['first_name' => 'Karine', 'last_name' => 'Garcia', 'email' => 'karine.garcia@example.com', 'segment' => 'regular', 'total_spent' => 43000, 'nb_orders' => 3],
            ['first_name' => 'Lucas', 'last_name' => 'Martinez', 'email' => 'lucas.martinez@example.com', 'segment' => 'ordered-once', 'total_spent' => 7999, 'nb_orders' => 1],
            ['first_name' => 'Marie', 'last_name' => 'Roux', 'email' => 'marie.roux@example.com', 'segment' => 'collectors', 'total_spent' => 289000, 'nb_orders' => 7],
            ['first_name' => 'Nicolas', 'last_name' => 'Fournier', 'email' => 'nicolas.fournier@example.com', 'segment' => 'regular', 'total_spent' => 78000, 'nb_orders' => 4],
            ['first_name' => 'Olivia', 'last_name' => 'Girard', 'email' => 'olivia.girard@example.com', 'segment' => 'compulsive', 'total_spent' => 210000, 'nb_orders' => 10],
        ];

        $createdCustomers = [];
        foreach ($customersData as $customerData) {
            $createdCustomers[] = Customer::create(array_merge($customerData, [
                'phone' => '+33 6 '.rand(10, 99).' '.rand(10, 99).' '.rand(10, 99).' '.rand(10, 99),
                'address' => [
                    'street' => rand(1, 200).' rue de la Paix',
                    'city' => 'Paris',
                    'zip' => '750'.rand(01, 20),
                    'country' => 'France',
                ],
            ]));
        }

        // Reviews (20) — need products
        $products = Product::all();
        if ($products->isEmpty()) {
            return;
        }

        $comments = [
            'Excellent product, exactly as described!',
            'Good quality but shipping was slow.',
            'Not what I expected, disappointed.',
            'Amazing! Will definitely buy again.',
            'Decent product for the price.',
            'The packaging was damaged on arrival.',
            'Perfect gift for my partner.',
            'Works great, highly recommend.',
            'Average quality, nothing special.',
            'Outstanding! Exceeded expectations.',
            'A bit expensive for what it is.',
            'Very satisfied with my purchase.',
            'Product broke after 2 weeks of use.',
            'Beautiful design and great quality.',
            'Could not be happier with this!',
            'Meets my needs perfectly.',
            'Not as pictured on the website.',
            'Fantastic value for money.',
            'Good product but lacks features.',
            'Absolutely love it, 5 stars!',
        ];

        $statuses = ['pending', 'pending', 'approved', 'approved', 'approved', 'rejected'];
        $ratings = [5, 5, 4, 4, 4, 3, 3, 2, 1, 5];

        for ($i = 0; $i < 20; $i++) {
            Review::create([
                'product_id' => $products->random()->id,
                'customer_id' => $createdCustomers[array_rand($createdCustomers)]->id,
                'rating' => $ratings[$i % count($ratings)],
                'comment' => $comments[$i],
                'status' => $statuses[$i % count($statuses)],
            ]);
        }
    }
}
