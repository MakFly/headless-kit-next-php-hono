/**
 * Support seed script
 *
 * Creates conversations, messages, canned responses with varying statuses
 */

import { db, schema } from '../index.ts';

const ADMIN_USER_ID = 'admin-00000000-0000-0000-0000-000000000001';
const USER_ID = 'user-00000000-0000-0000-0000-000000000002';

function daysAgo(n: number) {
  return new Date(Date.now() - n * 86400000).toISOString();
}

export async function seedSupport() {
  console.log('\nSeeding Support data...\n');

  // Check if already seeded
  const existing = await db.query.conversations.findFirst();
  if (existing) {
    console.log('  - Support data already exists, skipping');
    return;
  }

  const now = new Date().toISOString();

  // 10 conversations with varying statuses
  const convIds = Array.from({ length: 10 }, () => crypto.randomUUID());

  const conversations = [
    { id: convIds[0], userId: USER_ID, agentId: null, subject: 'Cannot login to my account', status: 'open', priority: 'high', rating: null, lastMessageAt: daysAgo(1), createdAt: daysAgo(3), updatedAt: daysAgo(1) },
    { id: convIds[1], userId: USER_ID, agentId: null, subject: 'Billing question about Pro plan', status: 'open', priority: 'medium', rating: null, lastMessageAt: daysAgo(2), createdAt: daysAgo(2), updatedAt: daysAgo(2) },
    { id: convIds[2], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Feature request: dark mode', status: 'assigned', priority: 'low', rating: null, lastMessageAt: daysAgo(1), createdAt: daysAgo(5), updatedAt: daysAgo(1) },
    { id: convIds[3], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Payment failed on checkout', status: 'waiting', priority: 'urgent', rating: null, lastMessageAt: daysAgo(0), createdAt: daysAgo(4), updatedAt: daysAgo(0) },
    { id: convIds[4], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Need help with API integration', status: 'waiting', priority: 'medium', rating: null, lastMessageAt: daysAgo(1), createdAt: daysAgo(6), updatedAt: daysAgo(1) },
    { id: convIds[5], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Account data export request', status: 'resolved', priority: 'medium', rating: 5, lastMessageAt: daysAgo(2), createdAt: daysAgo(7), updatedAt: daysAgo(2) },
    { id: convIds[6], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Bug in mobile app', status: 'resolved', priority: 'high', rating: 4, lastMessageAt: daysAgo(3), createdAt: daysAgo(10), updatedAt: daysAgo(3) },
    { id: convIds[7], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'How to change email address', status: 'closed', priority: 'low', rating: 3, lastMessageAt: daysAgo(5), createdAt: daysAgo(14), updatedAt: daysAgo(5) },
    { id: convIds[8], userId: USER_ID, agentId: ADMIN_USER_ID, subject: 'Refund request for order #1234', status: 'closed', priority: 'high', rating: 2, lastMessageAt: daysAgo(8), createdAt: daysAgo(20), updatedAt: daysAgo(8) },
    { id: convIds[9], userId: USER_ID, agentId: null, subject: 'General feedback on the platform', status: 'open', priority: 'low', rating: null, lastMessageAt: daysAgo(0), createdAt: daysAgo(1), updatedAt: daysAgo(0) },
  ];

  console.log('Creating conversations...');
  await db.insert(schema.conversations).values(conversations);
  console.log('  ✓ Created 10 conversations');

  // 30+ messages spread across conversations
  console.log('Creating messages...');
  const messagesData = [
    // Conv 0: open, no agent
    { conversationId: convIds[0], senderId: USER_ID, senderType: 'user', content: 'I cannot login to my account. I keep getting an invalid credentials error.', createdAt: daysAgo(3) },
    { conversationId: convIds[0], senderId: USER_ID, senderType: 'user', content: 'I have tried resetting my password but the reset email never arrives.', createdAt: daysAgo(2) },
    { conversationId: convIds[0], senderId: USER_ID, senderType: 'user', content: 'Any update on this?', createdAt: daysAgo(1) },

    // Conv 1: open, no agent
    { conversationId: convIds[1], senderId: USER_ID, senderType: 'user', content: 'I want to upgrade to the Pro plan. Is there a yearly discount?', createdAt: daysAgo(2) },

    // Conv 2: assigned
    { conversationId: convIds[2], senderId: USER_ID, senderType: 'user', content: 'It would be great to have a dark mode option.', createdAt: daysAgo(5) },
    { conversationId: convIds[2], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Thanks for the suggestion! Let me check our roadmap.', createdAt: daysAgo(4) },
    { conversationId: convIds[2], senderId: USER_ID, senderType: 'user', content: 'Any timeline for this?', createdAt: daysAgo(1) },

    // Conv 3: waiting (agent replied)
    { conversationId: convIds[3], senderId: USER_ID, senderType: 'user', content: 'My payment keeps failing on checkout. Card works everywhere else.', createdAt: daysAgo(4) },
    { conversationId: convIds[3], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'I can see the declined transactions. Can you try a different card?', createdAt: daysAgo(3) },
    { conversationId: convIds[3], senderId: USER_ID, senderType: 'user', content: 'Same issue with another card.', createdAt: daysAgo(2) },
    { conversationId: convIds[3], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'I have escalated this to our payments team. They will investigate.', createdAt: daysAgo(0) },

    // Conv 4: waiting
    { conversationId: convIds[4], senderId: USER_ID, senderType: 'user', content: 'I need help integrating your API with our backend.', createdAt: daysAgo(6) },
    { conversationId: convIds[4], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Sure! What stack are you using? I can share relevant docs.', createdAt: daysAgo(5) },
    { conversationId: convIds[4], senderId: USER_ID, senderType: 'user', content: 'We use NestJS. The webhook endpoint keeps timing out.', createdAt: daysAgo(3) },
    { conversationId: convIds[4], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Check that your endpoint responds within 5 seconds. Here is our webhook guide: docs.example.com/webhooks', createdAt: daysAgo(1) },

    // Conv 5: resolved, rated 5
    { conversationId: convIds[5], senderId: USER_ID, senderType: 'user', content: 'Can I export all my account data?', createdAt: daysAgo(7) },
    { conversationId: convIds[5], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Absolutely! Go to Settings > Privacy > Export Data.', createdAt: daysAgo(6) },
    { conversationId: convIds[5], senderId: USER_ID, senderType: 'user', content: 'Found it, thank you so much!', createdAt: daysAgo(5) },
    { conversationId: convIds[5], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Glad I could help! Let me know if you need anything else.', createdAt: daysAgo(2) },

    // Conv 6: resolved, rated 4
    { conversationId: convIds[6], senderId: USER_ID, senderType: 'user', content: 'The mobile app crashes when I open the settings page.', createdAt: daysAgo(10) },
    { conversationId: convIds[6], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Which device and OS version? We will investigate.', createdAt: daysAgo(9) },
    { conversationId: convIds[6], senderId: USER_ID, senderType: 'user', content: 'iPhone 15, iOS 18.2.', createdAt: daysAgo(8) },
    { conversationId: convIds[6], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'We found and fixed the bug. Update v2.3.1 is rolling out now.', createdAt: daysAgo(3) },

    // Conv 7: closed, rated 3
    { conversationId: convIds[7], senderId: USER_ID, senderType: 'user', content: 'How do I change my email address?', createdAt: daysAgo(14) },
    { conversationId: convIds[7], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Go to Account Settings > Email. You will need to verify the new address.', createdAt: daysAgo(13) },
    { conversationId: convIds[7], senderId: USER_ID, senderType: 'user', content: 'Done, thanks.', createdAt: daysAgo(5) },

    // Conv 8: closed, rated 2
    { conversationId: convIds[8], senderId: USER_ID, senderType: 'user', content: 'I need a refund for order #1234. The product arrived damaged.', createdAt: daysAgo(20) },
    { conversationId: convIds[8], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Sorry about that. Can you send a photo of the damage?', createdAt: daysAgo(19) },
    { conversationId: convIds[8], senderId: USER_ID, senderType: 'user', content: 'Here is the photo. This is unacceptable.', createdAt: daysAgo(18) },
    { conversationId: convIds[8], senderId: ADMIN_USER_ID, senderType: 'agent', content: 'Refund has been processed. It will appear in 3-5 business days.', createdAt: daysAgo(8) },

    // Conv 9: open, no agent
    { conversationId: convIds[9], senderId: USER_ID, senderType: 'user', content: 'Just wanted to say the new dashboard is great. One suggestion: add keyboard shortcuts.', createdAt: daysAgo(1) },
    { conversationId: convIds[9], senderId: USER_ID, senderType: 'user', content: 'Also, the search feature could be faster.', createdAt: daysAgo(0) },
  ];

  for (const msg of messagesData) {
    await db.insert(schema.messages).values({
      id: crypto.randomUUID(),
      ...msg,
    });
  }
  console.log(`  ✓ Created ${messagesData.length} messages`);

  // 5 canned responses
  console.log('Creating canned responses...');
  await db.insert(schema.cannedResponses).values([
    { id: crypto.randomUUID(), title: 'Greeting', content: 'Hello! Thank you for reaching out. How can I help you today?', category: 'general', shortcut: '/greet', createdBy: ADMIN_USER_ID, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), title: 'Follow Up', content: 'Just following up on this. Do you need any further assistance?', category: 'general', shortcut: '/followup', createdBy: ADMIN_USER_ID, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), title: 'Resolution', content: 'I believe this issue has been resolved. Please let me know if you are still experiencing problems.', category: 'resolution', shortcut: '/resolved', createdBy: ADMIN_USER_ID, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), title: 'Escalation', content: 'I am escalating this to our senior support team for further investigation.', category: 'escalation', shortcut: '/escalate', createdBy: ADMIN_USER_ID, createdAt: now, updatedAt: now },
    { id: crypto.randomUUID(), title: 'Closing', content: 'Thank you for contacting us! If you need help in the future, do not hesitate to reach out.', category: 'general', shortcut: '/close', createdBy: ADMIN_USER_ID, createdAt: now, updatedAt: now },
  ]);
  console.log('  ✓ Created 5 canned responses');

  console.log('\n✅ Support data seeded successfully!\n');
}

// Run standalone
if (import.meta.main) {
  seedSupport().catch((error) => {
    console.error('❌ Support seed failed:', error);
    process.exit(1);
  });
}
