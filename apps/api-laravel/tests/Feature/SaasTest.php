<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\Organization;
use App\Shared\Models\Plan;
use App\Shared\Models\TeamMember;
use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SaasTest extends TestCase
{
    use RefreshDatabase;

    private User $user;
    private User $otherUser;
    private Plan $plan;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test User',
            'email' => 'test@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $this->otherUser = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $this->plan = Plan::create([
            'name' => 'Starter',
            'slug' => 'starter',
            'price_monthly' => 900,
            'price_yearly' => 9000,
            'features' => ['Feature A', 'Feature B'],
            'limits' => ['maxMembers' => 10, 'maxProjects' => 10, 'maxStorage' => 5000, 'apiCallsPerMonth' => 10000],
        ]);
    }

    // =========================================================================
    // Plans (public)
    // =========================================================================

    public function test_anyone_can_list_plans(): void
    {
        $response = $this->getJson('/api/v1/saas/plans');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'name', 'slug', 'priceMonthly', 'priceYearly', 'features', 'limits']]]);
    }

    // =========================================================================
    // Auth required
    // =========================================================================

    public function test_get_subscription_without_auth_returns_401(): void
    {
        $response = $this->getJson('/api/v1/saas/subscription');

        $response->assertStatus(401);
    }

    // =========================================================================
    // Subscribe
    // =========================================================================

    public function test_user_can_subscribe_creates_org_and_invoice(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response->assertStatus(201)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonPath('data.plan.slug', 'starter');

        $this->assertDatabaseHas('organizations', ['owner_id' => $this->user->id]);
        $this->assertDatabaseHas('subscriptions', ['status' => 'active']);
        $this->assertDatabaseHas('invoices', ['amount' => 900, 'status' => 'pending']);

        $org = Organization::where('owner_id', $this->user->id)->first();
        $this->assertDatabaseHas('team_members', [
            'organization_id' => $org->id,
            'user_id' => $this->user->id,
            'role' => 'owner',
        ]);
    }

    public function test_subscribe_with_unknown_plan_returns_404(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'nonexistent']);

        $response->assertStatus(404);
    }

    public function test_subscribe_again_when_active_returns_409(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response->assertStatus(409);
    }

    // =========================================================================
    // Get subscription
    // =========================================================================

    public function test_user_can_get_their_subscription(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/subscription');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'active')
            ->assertJsonStructure(['data' => ['id', 'plan', 'status', 'currentPeriodStart', 'currentPeriodEnd']]);
    }

    public function test_get_subscription_returns_null_when_none(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/subscription');

        $response->assertStatus(200)
            ->assertJsonPath('data', null);
    }

    // =========================================================================
    // Cancel subscription
    // =========================================================================

    public function test_user_can_cancel_subscription(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->deleteJson('/api/v1/saas/subscription');

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'cancelled');

        $this->assertDatabaseHas('subscriptions', ['status' => 'cancelled']);
    }

    public function test_cancel_without_active_subscription_returns_404(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->deleteJson('/api/v1/saas/subscription');

        $response->assertStatus(404);
    }

    public function test_cancel_twice_returns_404(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $this->actingAs($this->user, 'betterauth')
            ->deleteJson('/api/v1/saas/subscription');

        $response = $this->actingAs($this->user, 'betterauth')
            ->deleteJson('/api/v1/saas/subscription');

        $response->assertStatus(404);
    }

    // =========================================================================
    // Invoices
    // =========================================================================

    public function test_user_can_list_invoices(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/invoices');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'amount', 'status', 'periodStart', 'periodEnd']]]);

        $this->assertCount(1, $response->json('data'));
    }

    // =========================================================================
    // Team
    // =========================================================================

    public function test_user_can_list_team(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/team');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'user', 'role', 'joinedAt']]]);

        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('owner', $response->json('data.0.role'));
    }

    public function test_user_can_invite_team_member(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/team/invite', [
                'email' => 'other@example.com',
                'role' => 'member',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.role', 'member')
            ->assertJsonPath('data.user.email', 'other@example.com');
    }

    public function test_invite_same_email_twice_returns_409(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/team/invite', ['email' => 'other@example.com', 'role' => 'member']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/team/invite', ['email' => 'other@example.com', 'role' => 'member']);

        $response->assertStatus(409);
    }

    public function test_user_can_change_team_member_role(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/team/invite', ['email' => 'other@example.com', 'role' => 'member']);

        $org = Organization::where('owner_id', $this->user->id)->first();
        $member = TeamMember::where('organization_id', $org->id)
            ->where('user_id', $this->otherUser->id)
            ->first();

        $response = $this->actingAs($this->user, 'betterauth')
            ->patchJson("/api/v1/saas/team/{$member->id}/role", ['role' => 'admin']);

        $response->assertStatus(200)
            ->assertJsonPath('data.role', 'admin');
    }

    public function test_cannot_change_owner_role_returns_403(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $org = Organization::where('owner_id', $this->user->id)->first();
        $ownerMember = TeamMember::where('organization_id', $org->id)->where('role', 'owner')->first();

        $response = $this->actingAs($this->user, 'betterauth')
            ->patchJson("/api/v1/saas/team/{$ownerMember->id}/role", ['role' => 'admin']);

        $response->assertStatus(403);
    }

    public function test_user_can_remove_team_member(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/team/invite', ['email' => 'other@example.com', 'role' => 'member']);

        $org = Organization::where('owner_id', $this->user->id)->first();
        $member = TeamMember::where('organization_id', $org->id)
            ->where('user_id', $this->otherUser->id)
            ->first();

        $response = $this->actingAs($this->user, 'betterauth')
            ->deleteJson("/api/v1/saas/team/{$member->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('team_members', ['id' => $member->id]);
    }

    public function test_cannot_remove_owner_returns_403(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $org = Organization::where('owner_id', $this->user->id)->first();
        $ownerMember = TeamMember::where('organization_id', $org->id)->where('role', 'owner')->first();

        $response = $this->actingAs($this->user, 'betterauth')
            ->deleteJson("/api/v1/saas/team/{$ownerMember->id}");

        $response->assertStatus(403);
    }

    // =========================================================================
    // Dashboard
    // =========================================================================

    public function test_user_can_get_dashboard(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/dashboard');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['activeMembers', 'totalProjects', 'apiCallsThisMonth', 'storageUsed', 'currentPlan']]);

        $this->assertEquals(1, $response->json('data.activeMembers'));
        $this->assertNotNull($response->json('data.currentPlan'));
    }

    // =========================================================================
    // Usage
    // =========================================================================

    public function test_user_can_get_usage(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/usage');

        $response->assertStatus(200)
            ->assertJsonStructure(['data']);
    }

    // =========================================================================
    // Settings
    // =========================================================================

    public function test_user_can_get_settings(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/saas/settings');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['organizationName', 'slug']]);
    }

    public function test_user_can_update_settings(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/saas/subscription', ['plan_slug' => 'starter']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->patchJson('/api/v1/saas/settings', [
                'organizationName' => 'My New Org Name',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.organizationName', 'My New Org Name');

        $this->assertDatabaseHas('organizations', ['owner_id' => $this->user->id, 'name' => 'My New Org Name']);
    }
}
