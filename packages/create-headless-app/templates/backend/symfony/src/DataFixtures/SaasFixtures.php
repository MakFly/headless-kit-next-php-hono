<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\Plan;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class SaasFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['saas'];
    }

    public function load(ObjectManager $manager): void
    {
        $plansData = [
            [
                'name' => 'Free',
                'slug' => 'free',
                'priceMonthly' => 0,
                'priceYearly' => 0,
                'features' => ['1 project', 'Community support', 'Basic analytics'],
                'limits' => ['maxMembers' => 1, 'maxProjects' => 1, 'maxStorage' => 100, 'apiCallsPerMonth' => 1000],
            ],
            [
                'name' => 'Starter',
                'slug' => 'starter',
                'priceMonthly' => 900,
                'priceYearly' => 9000,
                'features' => ['10 projects', 'Email support', 'Advanced analytics', 'Custom domain'],
                'limits' => ['maxMembers' => 5, 'maxProjects' => 10, 'maxStorage' => 5000, 'apiCallsPerMonth' => 50000],
            ],
            [
                'name' => 'Pro',
                'slug' => 'pro',
                'priceMonthly' => 2900,
                'priceYearly' => 29000,
                'features' => ['50 projects', 'Priority support', 'Full analytics', 'Custom domain', 'API access', 'SSO'],
                'limits' => ['maxMembers' => 25, 'maxProjects' => 50, 'maxStorage' => 50000, 'apiCallsPerMonth' => 500000],
            ],
            [
                'name' => 'Enterprise',
                'slug' => 'enterprise',
                'priceMonthly' => 9900,
                'priceYearly' => 99000,
                'features' => ['Unlimited projects', 'Dedicated support', 'Full analytics', 'Custom domain', 'API access', 'SSO', 'SLA', 'Custom integrations'],
                'limits' => ['maxMembers' => -1, 'maxProjects' => -1, 'maxStorage' => -1, 'apiCallsPerMonth' => -1],
            ],
        ];

        foreach ($plansData as $data) {
            $plan = new Plan();
            $plan->setName($data['name']);
            $plan->setSlug($data['slug']);
            $plan->setPriceMonthly($data['priceMonthly']);
            $plan->setPriceYearly($data['priceYearly']);
            $plan->setFeatures($data['features']);
            $plan->setLimits($data['limits']);
            $manager->persist($plan);
        }

        $manager->flush();
    }
}
