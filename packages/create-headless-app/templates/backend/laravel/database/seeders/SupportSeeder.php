<?php

declare(strict_types=1);

namespace Database\Seeders;

use App\Shared\Models\CannedResponse;
use App\Shared\Models\Conversation;
use App\Shared\Models\Message;
use App\Shared\Models\User;
use Illuminate\Database\Seeder;

class SupportSeeder extends Seeder
{
    public function run(): void
    {
        $admin = User::where('email', 'admin@example.com')->first();
        $user = User::where('email', 'user@example.com')->first();

        if ($admin === null || $user === null) {
            return;
        }

        // =========================================================================
        // Canned Responses (5)
        // =========================================================================
        $cannedData = [
            [
                'title' => 'Greeting',
                'content' => 'Hello! Thank you for reaching out to our support team. How can I help you today?',
                'category' => 'greeting',
                'shortcut' => 'hi',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Follow-up',
                'content' => 'I wanted to follow up on your recent support request. Have you been able to resolve the issue?',
                'category' => 'follow-up',
                'shortcut' => 'fu',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Resolution Confirmed',
                'content' => 'Great news! Your issue has been resolved. Please let us know if you need any further assistance.',
                'category' => 'resolution',
                'shortcut' => 'res',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Escalation Notice',
                'content' => 'I am escalating your case to our specialized team who will be better equipped to assist you with this issue.',
                'category' => 'escalation',
                'shortcut' => 'esc',
                'created_by' => $admin->id,
            ],
            [
                'title' => 'Closing Message',
                'content' => 'Thank you for contacting support. We hope we were able to help. Have a great day!',
                'category' => 'closing',
                'shortcut' => 'bye',
                'created_by' => $admin->id,
            ],
        ];

        foreach ($cannedData as $data) {
            CannedResponse::create($data);
        }

        // =========================================================================
        // Conversations (10) with messages
        // =========================================================================
        $conversationsData = [
            // 3 open
            ['subject' => 'Cannot login to my account', 'status' => 'open', 'priority' => 'high', 'messages' => ['I am unable to login. It says invalid credentials but I know my password is correct.', 'Have you tried resetting your password?']],
            ['subject' => 'Billing issue on last invoice', 'status' => 'open', 'priority' => 'urgent', 'messages' => ['I was charged twice for this month.']],
            ['subject' => 'Feature request: dark mode', 'status' => 'open', 'priority' => 'low', 'messages' => ['It would be great to have a dark mode option.', 'Thank you for the suggestion! We have noted this.']],

            // 2 assigned
            ['subject' => 'App crashes on startup', 'status' => 'assigned', 'priority' => 'high', 'agent' => $admin, 'messages' => ['The app crashes every time I open it on iOS 17.', 'We are investigating this issue.', 'Can you share your device model?', 'iPhone 14 Pro.']],
            ['subject' => 'Data export not working', 'status' => 'assigned', 'priority' => 'medium', 'agent' => $admin, 'messages' => ['The CSV export button does nothing.', 'I am looking into this for you.']],

            // 2 waiting
            ['subject' => 'Integration with Zapier broken', 'status' => 'waiting', 'priority' => 'medium', 'messages' => ['The Zapier integration stopped working after the last update.', 'Can you share the error message you see?']],
            ['subject' => 'Account migration request', 'status' => 'waiting', 'priority' => 'low', 'messages' => ['I would like to migrate my data from another account.', 'Please provide your old account email.']],

            // 2 resolved (with ratings)
            ['subject' => 'Password reset email not received', 'status' => 'resolved', 'priority' => 'high', 'rating' => 5, 'messages' => ['I did not receive the password reset email.', 'Please check your spam folder.', 'Found it, thank you!', 'Glad to help!']],
            ['subject' => 'Subscription upgrade question', 'status' => 'resolved', 'priority' => 'medium', 'rating' => 4, 'messages' => ['How do I upgrade to the Pro plan?', 'You can upgrade from your billing settings.', 'Done, thanks!']],

            // 1 closed (with rating)
            ['subject' => 'Refund request', 'status' => 'closed', 'priority' => 'high', 'rating' => 3, 'messages' => ['I would like a refund for last month.', 'I have processed your refund, it will appear in 3-5 days.', 'Received, thank you.']],
        ];

        foreach ($conversationsData as $data) {
            $conv = Conversation::create([
                'user_id' => $user->id,
                'agent_id' => isset($data['agent']) ? $data['agent']->id : null,
                'subject' => $data['subject'],
                'status' => $data['status'],
                'priority' => $data['priority'],
                'rating' => $data['rating'] ?? null,
                'last_message_at' => now(),
            ]);

            $senderTypes = ['user', 'agent'];
            foreach ($data['messages'] as $i => $content) {
                $senderType = $i % 2 === 0 ? 'user' : 'agent';
                $senderId = $senderType === 'user' ? $user->id : $admin->id;
                Message::create([
                    'conversation_id' => $conv->id,
                    'sender_id' => $senderId,
                    'sender_type' => $senderType,
                    'content' => $content,
                ]);
            }
        }
    }
}
