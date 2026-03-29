<?php

declare(strict_types=1);

namespace Tests\Feature;

use App\Shared\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use PHPUnit\Framework\Attributes\RunTestsInSeparateProcesses;
use Tests\TestCase;

#[RunTestsInSeparateProcesses]
final class PasswordResetTest extends TestCase
{
    use RefreshDatabase;

    private string $email = 'reset@example.com';

    private string $password = 'OldPassword1!';

    private string $newPassword = 'NewPassword1!';

    protected function setUp(): void
    {
        parent::setUp();
        Mail::fake();
    }

    private function createUser(): User
    {
        return User::create([
            'id' => Str::uuid()->toString(),
            'email' => $this->email,
            'password' => Hash::make($this->password),
            'name' => 'Reset User',
        ]);
    }

    private function insertResetToken(string $plainToken, int $ageSeconds = 0): void
    {
        DB::table('password_reset_tokens')->insert([
            'email' => $this->email,
            'token' => Hash::make($plainToken),
            'created_at' => now()->subSeconds($ageSeconds),
        ]);
    }

    // =========================================================================
    // POST /auth/password/forgot
    // =========================================================================

    public function test_forgot_password_returns_200_for_existing_email(): void
    {
        $this->createUser();

        $response = $this->postJson('/auth/password/forgot', ['email' => $this->email]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.message', 'If an account with that email exists, a password reset link has been sent.');
    }

    public function test_forgot_password_returns_200_for_unknown_email(): void
    {
        $response = $this->postJson('/auth/password/forgot', ['email' => 'nobody@example.com']);

        // Email-enumeration safe: always 200 even if email does not exist
        $response->assertStatus(200)
            ->assertJsonPath('success', true);
    }

    public function test_forgot_password_creates_token_in_database(): void
    {
        $this->createUser();

        $this->postJson('/auth/password/forgot', ['email' => $this->email]);

        $this->assertDatabaseHas('password_reset_tokens', ['email' => $this->email]);
    }

    public function test_forgot_password_sends_email(): void
    {
        $this->createUser();

        $this->postJson('/auth/password/forgot', ['email' => $this->email]);

        Mail::assertSent(\App\Mail\PasswordResetMail::class, fn ($mail) => $mail->hasTo($this->email));
    }

    public function test_forgot_password_does_not_send_email_for_unknown_address(): void
    {
        $this->postJson('/auth/password/forgot', ['email' => 'ghost@example.com']);

        Mail::assertNothingSent();
    }

    public function test_forgot_password_fails_without_email(): void
    {
        $response = $this->postJson('/auth/password/forgot', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    public function test_forgot_password_fails_with_invalid_email(): void
    {
        $response = $this->postJson('/auth/password/forgot', ['email' => 'not-an-email']);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['email']);
    }

    // =========================================================================
    // POST /auth/password/verify-token
    // =========================================================================

    public function test_verify_token_returns_valid_true_for_fresh_token(): void
    {
        $this->createUser();
        $plainToken = 'fresh-token-abc123';
        $this->insertResetToken($plainToken);

        $response = $this->postJson('/auth/password/verify-token', ['token' => $plainToken]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.valid', true)
            ->assertJsonPath('data.email', $this->email);
    }

    public function test_verify_token_returns_valid_false_for_unknown_token(): void
    {
        $response = $this->postJson('/auth/password/verify-token', ['token' => 'totally-invalid-token']);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.valid', false);
    }

    public function test_verify_token_returns_valid_false_for_expired_token(): void
    {
        $this->createUser();
        $plainToken = 'expired-token';
        $this->insertResetToken($plainToken, ageSeconds: 7201); // 2 hours ago

        $response = $this->postJson('/auth/password/verify-token', ['token' => $plainToken]);

        $response->assertStatus(200)
            ->assertJsonPath('data.valid', false);
    }

    public function test_verify_token_fails_without_token(): void
    {
        $response = $this->postJson('/auth/password/verify-token', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token']);
    }

    // =========================================================================
    // POST /auth/password/reset
    // =========================================================================

    public function test_reset_password_succeeds_with_valid_token(): void
    {
        $this->createUser();
        $plainToken = 'valid-reset-token';
        $this->insertResetToken($plainToken);

        $response = $this->postJson('/auth/password/reset', [
            'token' => $plainToken,
            'newPassword' => $this->newPassword,
        ]);

        $response->assertStatus(200)
            ->assertJsonPath('success', true)
            ->assertJsonPath('data.message', 'Password reset successfully.');
    }

    public function test_reset_password_actually_updates_password_in_db(): void
    {
        $this->createUser();
        $plainToken = 'update-pw-token';
        $this->insertResetToken($plainToken);

        $this->postJson('/auth/password/reset', [
            'token' => $plainToken,
            'newPassword' => $this->newPassword,
        ]);

        $user = User::where('email', $this->email)->first();
        $this->assertTrue(Hash::check($this->newPassword, $user->password));
    }

    public function test_reset_password_invalidates_token_after_use(): void
    {
        $this->createUser();
        $plainToken = 'single-use-token';
        $this->insertResetToken($plainToken);

        $this->postJson('/auth/password/reset', [
            'token' => $plainToken,
            'newPassword' => $this->newPassword,
        ]);

        $this->assertDatabaseMissing('password_reset_tokens', ['email' => $this->email]);
    }

    public function test_reset_password_fails_with_expired_token(): void
    {
        $this->createUser();
        $plainToken = 'expired-reset-token';
        $this->insertResetToken($plainToken, ageSeconds: 7201); // 2 hours ago

        $response = $this->postJson('/auth/password/reset', [
            'token' => $plainToken,
            'newPassword' => $this->newPassword,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVALID_TOKEN');
    }

    public function test_reset_password_fails_with_invalid_token(): void
    {
        $response = $this->postJson('/auth/password/reset', [
            'token' => 'wrong-token',
            'newPassword' => $this->newPassword,
        ]);

        $response->assertStatus(422)
            ->assertJsonPath('error.code', 'INVALID_TOKEN');
    }

    public function test_reset_password_fails_without_required_fields(): void
    {
        $response = $this->postJson('/auth/password/reset', []);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['token', 'newPassword']);
    }

    public function test_reset_password_fails_with_weak_password(): void
    {
        $response = $this->postJson('/auth/password/reset', [
            'token' => 'some-token',
            'newPassword' => 'weak',
        ]);

        $response->assertStatus(422)
            ->assertJsonValidationErrors(['newPassword']);
    }
}
