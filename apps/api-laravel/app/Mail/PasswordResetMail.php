<?php

declare(strict_types=1);

namespace App\Mail;

use Illuminate\Bus\Queueable;
use Illuminate\Mail\Mailable;
use Illuminate\Mail\Mailables\Content;
use Illuminate\Mail\Mailables\Envelope;
use Illuminate\Queue\SerializesModels;

class PasswordResetMail extends Mailable
{
    use Queueable, SerializesModels;

    public function __construct(
        public readonly string $resetToken,
        public readonly string $userEmail,
    ) {}

    public function envelope(): Envelope
    {
        return new Envelope(
            subject: 'Reset your password',
        );
    }

    public function content(): Content
    {
        $frontendUrl = config('app.frontend_url', env('FRONTEND_URL', 'http://localhost:3300'));
        $resetUrl = $frontendUrl.'/auth/reset-password?token='.$this->resetToken;

        return new Content(
            htmlString: <<<HTML
                <p>You requested a password reset.</p>
                <p>Click the link below to reset your password (valid for 1 hour):</p>
                <p><a href="{$resetUrl}">{$resetUrl}</a></p>
                <p>If you did not request a password reset, you can safely ignore this email.</p>
                HTML,
        );
    }
}
