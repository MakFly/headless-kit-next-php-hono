/**
 * Support repository
 */

import { eq, and, desc, asc, sql, isNull } from 'drizzle-orm';
import { db, schema } from '../../shared/db/index.ts';

// =========================================================================
// Conversations
// =========================================================================

export async function createConversation(data: {
  subject: string;
  userId: string;
  priority?: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.conversations).values({
    id,
    subject: data.subject,
    status: 'open',
    priority: data.priority || 'medium',
    userId: data.userId,
    createdAt: now,
    updatedAt: now,
  });

  return findConversationById(id);
}

export async function findConversationById(id: string) {
  const result = await db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.id, id))
    .limit(1);

  return result[0] ?? null;
}

export async function findConversationsByUserId(userId: string) {
  return db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.userId, userId))
    .orderBy(desc(schema.conversations.updatedAt));
}

export async function findConversationsByAgentId(agentId: string) {
  return db
    .select()
    .from(schema.conversations)
    .where(eq(schema.conversations.agentId, agentId))
    .orderBy(desc(schema.conversations.updatedAt));
}

export async function findUnassignedConversations() {
  return db
    .select()
    .from(schema.conversations)
    .where(and(
      eq(schema.conversations.status, 'open'),
      isNull(schema.conversations.agentId)
    ))
    .orderBy(asc(schema.conversations.createdAt));
}

export async function updateConversation(id: string, data: Partial<{
  subject: string;
  status: string;
  priority: string;
  agentId: string | null;
  rating: number | null;
  lastMessageAt: string | null;
}>) {
  await db
    .update(schema.conversations)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.conversations.id, id));

  return findConversationById(id);
}

export async function assignAgent(conversationId: string, agentId: string) {
  return updateConversation(conversationId, { agentId, status: 'assigned' });
}

// =========================================================================
// Messages
// =========================================================================

export async function createMessage(data: {
  conversationId: string;
  senderId: string;
  senderType: string;
  content: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.messages).values({
    id,
    conversationId: data.conversationId,
    senderId: data.senderId,
    senderType: data.senderType,
    content: data.content,
    createdAt: now,
  });

  // Update conversation lastMessageAt
  await db
    .update(schema.conversations)
    .set({ lastMessageAt: now, updatedAt: now })
    .where(eq(schema.conversations.id, data.conversationId));

  return db.query.messages.findFirst({ where: eq(schema.messages.id, id) });
}

export async function findMessagesByConversationId(conversationId: string) {
  return db
    .select()
    .from(schema.messages)
    .where(eq(schema.messages.conversationId, conversationId))
    .orderBy(asc(schema.messages.createdAt));
}

// =========================================================================
// Canned Responses
// =========================================================================

export async function findAllCannedResponses() {
  return db.select().from(schema.cannedResponses).orderBy(asc(schema.cannedResponses.title));
}

export async function findCannedResponseById(id: string) {
  return db.query.cannedResponses.findFirst({
    where: eq(schema.cannedResponses.id, id),
  }) ?? null;
}

export async function createCannedResponse(data: {
  title: string;
  content: string;
  category?: string;
  shortcut?: string;
  createdBy: string;
}) {
  const id = crypto.randomUUID();
  const now = new Date().toISOString();

  await db.insert(schema.cannedResponses).values({
    id,
    title: data.title,
    content: data.content,
    category: data.category || null,
    shortcut: data.shortcut || null,
    createdBy: data.createdBy,
    createdAt: now,
    updatedAt: now,
  });

  return db.query.cannedResponses.findFirst({ where: eq(schema.cannedResponses.id, id) });
}

export async function updateCannedResponse(id: string, data: Partial<{
  title: string;
  content: string;
  category: string;
  shortcut: string;
}>) {
  await db
    .update(schema.cannedResponses)
    .set({ ...data, updatedAt: new Date().toISOString() })
    .where(eq(schema.cannedResponses.id, id));

  return findCannedResponseById(id);
}

export async function deleteCannedResponse(id: string) {
  const existing = await findCannedResponseById(id);
  if (!existing) return false;

  await db.delete(schema.cannedResponses).where(eq(schema.cannedResponses.id, id));
  return true;
}

// =========================================================================
// CSAT Ratings (stored on conversation.rating)
// =========================================================================

export async function getRatingStats() {
  const rated = await db
    .select({
      rating: schema.conversations.rating,
    })
    .from(schema.conversations)
    .where(sql`${schema.conversations.rating} IS NOT NULL`);

  if (rated.length === 0) {
    return { average: 0, total: 0, distribution: { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 } };
  }

  const distribution: Record<string, number> = { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 };
  let sum = 0;

  for (const r of rated) {
    if (r.rating !== null) {
      sum += r.rating;
      distribution[String(r.rating)] = (distribution[String(r.rating)] || 0) + 1;
    }
  }

  return {
    average: Math.round((sum / rated.length) * 10) / 10,
    total: rated.length,
    distribution,
  };
}
