<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\CannedResponse;
use App\Shared\Models\Conversation;
use App\Shared\Models\Message;
use App\Shared\Models\Role;
use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Str;
use Tests\TestCase;

class SupportTest extends TestCase
{
    use RefreshDatabase;

    private User $user;

    private User $otherUser;

    private User $admin;

    protected function setUp(): void
    {
        parent::setUp();

        $this->user = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Test User',
            'email' => 'user@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        $this->otherUser = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Other User',
            'email' => 'other@example.com',
            'password' => bcrypt('Password123!'),
        ]);

        Role::create(['name' => 'Admin', 'slug' => 'admin', 'description' => 'Administrator']);

        $this->admin = User::create([
            'id' => (string) Str::uuid(),
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => bcrypt('Password123!'),
        ]);
        $this->admin->assignRole('admin');
    }

    // =========================================================================
    // Auth
    // =========================================================================

    public function test_list_conversations_without_auth_returns_401(): void
    {
        $this->getJson('/api/v1/support/conversations')->assertStatus(401);
    }

    // =========================================================================
    // Create conversation
    // =========================================================================

    public function test_user_can_create_conversation(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/support/conversations', [
                'subject' => 'Help with billing',
                'message' => 'I have a question about my invoice.',
                'priority' => 'medium',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.subject', 'Help with billing')
            ->assertJsonPath('data.status', 'open');

        $this->assertDatabaseHas('conversations', ['subject' => 'Help with billing', 'user_id' => $this->user->id]);
        $this->assertDatabaseHas('messages', ['content' => 'I have a question about my invoice.', 'sender_type' => 'user']);
    }

    public function test_create_conversation_without_subject_returns_422(): void
    {
        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson('/api/v1/support/conversations', [
                'message' => 'No subject provided',
            ]);

        $response->assertStatus(422);
    }

    // =========================================================================
    // List conversations
    // =========================================================================

    public function test_user_can_list_only_their_conversations(): void
    {
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'Mine', 'status' => 'open', 'priority' => 'medium']);
        Conversation::create(['user_id' => $this->otherUser->id, 'subject' => 'Not mine', 'status' => 'open', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/support/conversations');

        $response->assertStatus(200);
        $this->assertCount(1, $response->json('data'));
        $this->assertEquals('Mine', $response->json('data.0.subject'));
    }

    // =========================================================================
    // Show conversation
    // =========================================================================

    public function test_user_can_show_own_conversation_with_messages(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'medium']);
        Message::create(['conversation_id' => $conv->id, 'sender_id' => $this->user->id, 'sender_type' => 'user', 'content' => 'Hello']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson("/api/v1/support/conversations/{$conv->id}");

        $response->assertStatus(200)
            ->assertJsonPath('data.id', $conv->id)
            ->assertJsonStructure(['data' => ['id', 'subject', 'status', 'messages']]);

        $this->assertCount(1, $response->json('data.messages'));
    }

    public function test_user_cannot_show_other_users_conversation(): void
    {
        $conv = Conversation::create(['user_id' => $this->otherUser->id, 'subject' => 'Private', 'status' => 'open', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->getJson("/api/v1/support/conversations/{$conv->id}");

        $response->assertStatus(403);
    }

    // =========================================================================
    // Send message
    // =========================================================================

    public function test_user_can_send_message_to_open_conversation(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Test', 'status' => 'open', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson("/api/v1/support/conversations/{$conv->id}/messages", [
                'content' => 'Follow-up question',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.content', 'Follow-up question')
            ->assertJsonPath('data.senderType', 'user');

        $this->assertDatabaseHas('messages', ['conversation_id' => $conv->id, 'content' => 'Follow-up question']);
    }

    public function test_user_cannot_send_message_to_closed_conversation(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Closed', 'status' => 'closed', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson("/api/v1/support/conversations/{$conv->id}/messages", [
                'content' => 'Too late',
            ]);

        $response->assertStatus(422);
    }

    // =========================================================================
    // Rate conversation
    // =========================================================================

    public function test_user_can_rate_resolved_conversation(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Resolved', 'status' => 'resolved', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson("/api/v1/support/conversations/{$conv->id}/rate", ['rating' => 5]);

        $response->assertStatus(200)
            ->assertJsonPath('data.rating', 5);

        $this->assertDatabaseHas('conversations', ['id' => $conv->id, 'rating' => 5]);
    }

    public function test_rating_already_rated_conversation_returns_409(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Resolved', 'status' => 'resolved', 'priority' => 'medium', 'rating' => 4]);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson("/api/v1/support/conversations/{$conv->id}/rate", ['rating' => 5]);

        $response->assertStatus(409);
    }

    public function test_rating_out_of_range_returns_422(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Resolved', 'status' => 'resolved', 'priority' => 'medium']);

        $response = $this->actingAs($this->user, 'betterauth')
            ->postJson("/api/v1/support/conversations/{$conv->id}/rate", ['rating' => 6]);

        $response->assertStatus(422);
    }

    // =========================================================================
    // Agent — Queue
    // =========================================================================

    public function test_non_admin_cannot_access_agent_queue(): void
    {
        $this->actingAs($this->user, 'betterauth')
            ->getJson('/api/v1/support/agent/queue')
            ->assertStatus(403);
    }

    public function test_admin_can_get_agent_queue(): void
    {
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'Open 1', 'status' => 'open', 'priority' => 'medium']);
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'Assigned', 'status' => 'assigned', 'priority' => 'medium', 'agent_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/support/agent/queue');

        $response->assertStatus(200);
        // Only unassigned open conversations
        $subjects = collect($response->json('data'))->pluck('subject');
        $this->assertContains('Open 1', $subjects);
        $this->assertNotContains('Assigned', $subjects);
    }

    // =========================================================================
    // Agent — Assign
    // =========================================================================

    public function test_admin_can_assign_conversation(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Unassigned', 'status' => 'open', 'priority' => 'medium']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/support/agent/conversations/{$conv->id}/assign");

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'assigned');

        $this->assertDatabaseHas('conversations', ['id' => $conv->id, 'agent_id' => $this->admin->id, 'status' => 'assigned']);
    }

    public function test_assigning_already_assigned_conversation_returns_409(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Already', 'status' => 'assigned', 'priority' => 'medium', 'agent_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/support/agent/conversations/{$conv->id}/assign");

        $response->assertStatus(409);
    }

    // =========================================================================
    // Agent — Status update
    // =========================================================================

    public function test_admin_can_update_conversation_status(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Test', 'status' => 'assigned', 'priority' => 'medium', 'agent_id' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/support/agent/conversations/{$conv->id}/status", ['status' => 'resolved']);

        $response->assertStatus(200)
            ->assertJsonPath('data.status', 'resolved');

        $this->assertDatabaseHas('conversations', ['id' => $conv->id, 'status' => 'resolved']);
    }

    public function test_invalid_status_transition_returns_422(): void
    {
        $conv = Conversation::create(['user_id' => $this->user->id, 'subject' => 'Closed', 'status' => 'closed', 'priority' => 'medium']);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->patchJson("/api/v1/support/agent/conversations/{$conv->id}/status", ['status' => 'assigned']);

        $response->assertStatus(422);
    }

    // =========================================================================
    // Agent — Canned Responses CRUD
    // =========================================================================

    public function test_admin_can_list_canned_responses(): void
    {
        CannedResponse::create(['title' => 'Hi', 'content' => 'Hello!', 'created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/support/agent/canned');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => [['id', 'title', 'content', 'category', 'shortcut']]]);
    }

    public function test_admin_can_create_canned_response(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/support/agent/canned', [
                'title' => 'Greeting',
                'content' => 'Hello, how can I help?',
                'category' => 'greeting',
                'shortcut' => 'hi',
            ]);

        $response->assertStatus(201)
            ->assertJsonPath('data.title', 'Greeting')
            ->assertJsonPath('data.shortcut', 'hi');

        $this->assertDatabaseHas('canned_responses', ['title' => 'Greeting']);
    }

    public function test_create_canned_response_without_required_fields_returns_422(): void
    {
        $response = $this->actingAs($this->admin, 'betterauth')
            ->postJson('/api/v1/support/agent/canned', [
                'title' => 'Missing content',
            ]);

        $response->assertStatus(422);
    }

    public function test_admin_can_update_canned_response(): void
    {
        $canned = CannedResponse::create(['title' => 'Old', 'content' => 'Old content', 'created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->putJson("/api/v1/support/agent/canned/{$canned->id}", [
                'title' => 'Updated',
                'content' => 'New content',
            ]);

        $response->assertStatus(200)
            ->assertJsonPath('data.title', 'Updated');
    }

    public function test_admin_can_delete_canned_response(): void
    {
        $canned = CannedResponse::create(['title' => 'To delete', 'content' => 'Bye', 'created_by' => $this->admin->id]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->deleteJson("/api/v1/support/agent/canned/{$canned->id}");

        $response->assertStatus(200);
        $this->assertDatabaseMissing('canned_responses', ['id' => $canned->id]);
    }

    // =========================================================================
    // Agent — Ratings stats
    // =========================================================================

    public function test_admin_can_get_ratings_stats(): void
    {
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'R1', 'status' => 'resolved', 'priority' => 'medium', 'rating' => 5]);
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'R2', 'status' => 'resolved', 'priority' => 'medium', 'rating' => 4]);
        Conversation::create(['user_id' => $this->user->id, 'subject' => 'R3', 'status' => 'closed', 'priority' => 'medium', 'rating' => 3]);

        $response = $this->actingAs($this->admin, 'betterauth')
            ->getJson('/api/v1/support/agent/ratings');

        $response->assertStatus(200)
            ->assertJsonStructure(['data' => ['average', 'total', 'distribution']])
            ->assertJsonPath('data.total', 3)
            ->assertJsonPath('data.distribution.5', 1)
            ->assertJsonPath('data.distribution.4', 1)
            ->assertJsonPath('data.distribution.3', 1);

        $this->assertEquals(4.0, $response->json('data.average'));
    }
}
