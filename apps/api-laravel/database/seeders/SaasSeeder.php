<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Shared\Models\Invoice;
use App\Shared\Models\Organization;
use App\Shared\Models\Plan;
use App\Shared\Models\Subscription;
use App\Shared\Models\TeamMember;
use App\Shared\Models\UsageRecord;
use App\Shared\Models\User;
use Illuminate\Database\Seeder;

class SaasSeeder extends Seeder
{
    public function run(): void
    {
        // =========================================================================
        // Plans
        // =========================================================================
        Plan::create([
            'name' => 'Free',
            'slug' => 'free',
            'price_monthly' => 0,
            'price_yearly' => 0,
            'features' => ['Up to 3 members', '2 projects', '500MB storage', 'Community support'],
            'limits' => ['maxMembers' => 3, 'maxProjects' => 2, 'maxStorage' => 500, 'apiCallsPerMonth' => 1000],
        ]);

        $starter = Plan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'price_monthly' => 900,
            'price_yearly' => 9000,
            'features' => ['Up to 10 members', '10 projects', '5GB storage', 'Email support', 'API access'],
            'limits' => ['maxMembers' => 10, 'maxProjects' => 10, 'maxStorage' => 5000, 'apiCallsPerMonth' => 10000],
        ]);

        $pro = Plan::create([
            'name' => 'Pro',
            'slug' => 'pro',
            'price_monthly' => 2900,
            'price_yearly' => 29000,
            'features' => ['Up to 50 members', '50 projects', '50GB storage', 'Priority support', 'Advanced analytics', 'SSO'],
            'limits' => ['maxMembers' => 50, 'maxProjects' => 50, 'maxStorage' => 50000, 'apiCallsPerMonth' => 100000],
        ]);

        Plan::create([
            'name' => 'Enterprise',
            'slug' => 'enterprise',
            'price_monthly' => 9900,
            'price_yearly' => 99000,
            'features' => ['Unlimited members', 'Unlimited projects', '1TB storage', 'Dedicated support', 'Custom integrations', 'SLA', 'Audit logs'],
            'limits' => ['maxMembers' => 999, 'maxProjects' => 999, 'maxStorage' => 1000000, 'apiCallsPerMonth' => 10000000],
        ]);

        // =========================================================================
        // Demo Organization (admin user)
        // =========================================================================
        $admin = User::where('email', 'admin@example.com')->first();
        if ($admin === null) {
            return;
        }

        $org = Organization::create([
            'name' => 'Acme Corp',
            'slug' => 'acme-corp',
            'owner_id' => $admin->id,
            'plan_id' => $pro->id,
        ]);

        TeamMember::create([
            'organization_id' => $org->id,
            'user_id' => $admin->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        $now = now();
        $sub = Subscription::create([
            'organization_id' => $org->id,
            'plan_id' => $pro->id,
            'status' => 'active',
            'current_period_start' => $now->copy()->startOfMonth(),
            'current_period_end' => $now->copy()->endOfMonth(),
        ]);

        // Past paid invoices
        for ($i = 3; $i >= 1; $i--) {
            Invoice::create([
                'organization_id' => $org->id,
                'amount' => $pro->price_monthly,
                'status' => 'paid',
                'period_start' => $now->copy()->subMonths($i)->startOfMonth(),
                'period_end' => $now->copy()->subMonths($i)->endOfMonth(),
                'paid_at' => $now->copy()->subMonths($i)->startOfMonth()->addDays(2),
            ]);
        }

        Invoice::create([
            'organization_id' => $org->id,
            'amount' => $pro->price_monthly,
            'status' => 'pending',
            'period_start' => $now->copy()->startOfMonth(),
            'period_end' => $now->copy()->endOfMonth(),
        ]);

        // Usage records
        foreach ([
            ['metric' => 'api_calls', 'value' => 45230, 'limit_value' => 100000],
            ['metric' => 'storage', 'value' => 12400, 'limit_value' => 50000],
            ['metric' => 'members', 'value' => 8, 'limit_value' => 50],
            ['metric' => 'projects', 'value' => 12, 'limit_value' => 50],
        ] as $m) {
            UsageRecord::create(array_merge($m, [
                'organization_id' => $org->id,
                'recorded_at' => now(),
            ]));
        }

        // Add a couple of extra team members to Acme Corp
        $regularUser = User::where('email', 'user@example.com')->first();
        if ($regularUser !== null) {
            TeamMember::create([
                'organization_id' => $org->id,
                'user_id' => $regularUser->id,
                'role' => 'member',
                'joined_at' => now()->subDays(30),
            ]);
        }

        // =========================================================================
        // Second Organization — Side Project (admin user, no subscription)
        // =========================================================================
        $sideProject = Organization::create([
            'name' => 'Side Project',
            'slug' => 'side-project',
            'owner_id' => $admin->id,
        ]);

        TeamMember::create([
            'organization_id' => $sideProject->id,
            'user_id' => $admin->id,
            'role' => 'owner',
            'joined_at' => now(),
        ]);

        // Light usage records for the side project
        foreach ([
            ['metric' => 'api_calls', 'value' => 210, 'limit_value' => 1000],
            ['metric' => 'storage', 'value' => 45, 'limit_value' => 500],
            ['metric' => 'projects', 'value' => 1, 'limit_value' => 2],
        ] as $m) {
            UsageRecord::create(array_merge($m, [
                'organization_id' => $sideProject->id,
                'recorded_at' => now(),
            ]));
        }
    }
}
