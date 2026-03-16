<?php

declare(strict_types=1);

namespace App\DataFixtures;

use App\Entity\CannedResponse;
use App\Entity\ChatMessage;
use App\Entity\Conversation;
use App\Entity\User;
use Doctrine\Bundle\FixturesBundle\Fixture;
use Doctrine\Bundle\FixturesBundle\FixtureGroupInterface;
use Doctrine\Persistence\ObjectManager;

class SupportFixtures extends Fixture implements FixtureGroupInterface
{
    public static function getGroups(): array
    {
        return ['support'];
    }

    public function load(ObjectManager $manager): void
    {
        // Get existing users
        $users = $manager->getRepository(User::class)->findAll();
        if (count($users) < 2) {
            return;
        }

        $user1 = $users[0];
        $user2 = $users[1];
        $agent = $users[count($users) - 1]; // last user as agent

        // ------------------------------------------------------------------
        // 10 Conversations with 30+ messages
        // ------------------------------------------------------------------

        $conversationsData = [
            ['subject' => 'Cannot login to my account', 'status' => 'resolved', 'priority' => 'high', 'rating' => 5, 'user' => $user1, 'agent' => $agent],
            ['subject' => 'Billing issue with last invoice', 'status' => 'closed', 'priority' => 'medium', 'rating' => 4, 'user' => $user2, 'agent' => $agent],
            ['subject' => 'Feature request: dark mode', 'status' => 'closed', 'priority' => 'low', 'rating' => 3, 'user' => $user1, 'agent' => $agent],
            ['subject' => 'API rate limiting questions', 'status' => 'assigned', 'priority' => 'medium', 'rating' => null, 'user' => $user2, 'agent' => $agent],
            ['subject' => 'Data export not working', 'status' => 'waiting', 'priority' => 'high', 'rating' => null, 'user' => $user1, 'agent' => $agent],
            ['subject' => 'How to integrate webhooks?', 'status' => 'open', 'priority' => 'medium', 'rating' => null, 'user' => $user2, 'agent' => null],
            ['subject' => 'SSL certificate error', 'status' => 'open', 'priority' => 'urgent', 'rating' => null, 'user' => $user1, 'agent' => null],
            ['subject' => 'Team member permissions issue', 'status' => 'open', 'priority' => 'medium', 'rating' => null, 'user' => $user2, 'agent' => null],
            ['subject' => 'Mobile app crash on startup', 'status' => 'assigned', 'priority' => 'urgent', 'rating' => null, 'user' => $user1, 'agent' => $agent],
            ['subject' => 'Password reset email not received', 'status' => 'resolved', 'priority' => 'high', 'rating' => null, 'user' => $user2, 'agent' => $agent],
        ];

        $messagesPerConv = [
            // Conv 1: login issue — 4 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'I cannot login to my account. It says invalid credentials but I am sure my password is correct.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'I can see your account is locked due to too many failed attempts. Let me unlock it for you.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'Your account has been unlocked. Please try logging in again.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'It works now, thank you so much!'],
            ],
            // Conv 2: billing — 3 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'I was charged twice for the Pro plan this month.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'I can see the duplicate charge. A refund has been initiated and should appear within 5 business days.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Perfect, thanks for the quick resolution.'],
            ],
            // Conv 3: feature request — 3 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Would love to see a dark mode option in the dashboard.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'Great suggestion! I have forwarded this to our product team. Dark mode is on our roadmap for Q3.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Awesome, looking forward to it!'],
            ],
            // Conv 4: API rate limiting — 4 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'What are the API rate limits for the Starter plan?'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'The Starter plan allows 1000 API calls per month. You can check your usage in the dashboard.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Can I upgrade to get more calls without changing my plan?'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'Additional API calls are available as add-ons. I can help you set that up if you are interested.'],
            ],
            // Conv 5: data export — 3 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'The CSV export button gives me a 500 error.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'I have reproduced the issue and escalated it to our engineering team. We are working on a fix.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Any ETA on the fix?'],
            ],
            // Conv 6: webhooks — 2 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Where can I find the webhook documentation?'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Also, do you support retry on webhook failure?'],
            ],
            // Conv 7: SSL — 2 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Getting SSL_ERROR_HANDSHAKE_FAILURE when accessing the API endpoint.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'This started happening after your last maintenance window.'],
            ],
            // Conv 8: permissions — 2 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'I added a team member as admin but they cannot access billing settings.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Is billing restricted to the owner only?'],
            ],
            // Conv 9: mobile crash — 3 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'The mobile app crashes immediately after the splash screen on iOS 18.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'Can you please share the crash logs? Go to Settings > Privacy > Analytics > Analytics Data and look for our app name.'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Here they are: Exception Type: EXC_CRASH (SIGABRT). Thread 0 crashed.'],
            ],
            // Conv 10: password reset — 4 messages
            [
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'I requested a password reset but never received the email.'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'I checked our email logs and the reset email was sent but bounced. Is your email address still active?'],
                ['senderId' => 'user', 'senderType' => 'user', 'content' => 'Yes it is. Can you try sending it again?'],
                ['senderId' => 'agent', 'senderType' => 'agent', 'content' => 'I have resent the reset email. Please also check your spam folder.'],
            ],
        ];

        foreach ($conversationsData as $i => $cData) {
            $conv = new Conversation();
            $conv->setSubject($cData['subject']);
            $conv->setUser($cData['user']);
            $conv->setStatus($cData['status']);
            $conv->setPriority($cData['priority']);

            if ($cData['agent']) {
                $conv->setAgent($cData['agent']);
            }
            if ($cData['rating'] !== null) {
                $conv->setRating($cData['rating']);
            }

            $manager->persist($conv);

            $lastMsgAt = null;
            foreach ($messagesPerConv[$i] as $mData) {
                $msg = new ChatMessage();
                $msg->setConversation($conv);
                $msg->setSenderId($mData['senderType'] === 'user' ? $cData['user']->getId() : ($cData['agent'] ? $cData['agent']->getId() : $cData['user']->getId()));
                $msg->setSenderType($mData['senderType']);
                $msg->setContent($mData['content']);
                $lastMsgAt = $msg->getCreatedAt();
                $manager->persist($msg);
            }

            if ($lastMsgAt) {
                $conv->setLastMessageAt($lastMsgAt);
            }
        }

        // ------------------------------------------------------------------
        // 5 Canned Responses
        // ------------------------------------------------------------------

        $agentId = $agent->getId();

        $cannedData = [
            ['title' => 'Greeting', 'content' => 'Hello! Thank you for reaching out. How can I help you today?', 'category' => 'general', 'shortcut' => '/hello'],
            ['title' => 'Password Reset', 'content' => 'You can reset your password by clicking on "Forgot Password" on the login page. A reset link will be sent to your email.', 'category' => 'account', 'shortcut' => '/password'],
            ['title' => 'Billing Question', 'content' => 'For billing inquiries, please provide your account email and the specific charge you have questions about.', 'category' => 'billing', 'shortcut' => '/billing'],
            ['title' => 'Escalation', 'content' => 'I understand this is a critical issue. I am escalating this to our senior support team. They will follow up within 24 hours.', 'category' => 'general', 'shortcut' => '/escalate'],
            ['title' => 'Closing', 'content' => 'Is there anything else I can help you with? If not, I will close this ticket. Thank you for contacting support!', 'category' => 'general', 'shortcut' => '/close'],
        ];

        foreach ($cannedData as $data) {
            $response = new CannedResponse();
            $response->setTitle($data['title']);
            $response->setContent($data['content']);
            $response->setCategory($data['category']);
            $response->setShortcut($data['shortcut']);
            $response->setCreatedBy($agentId);
            $manager->persist($response);
        }

        $manager->flush();
    }
}
