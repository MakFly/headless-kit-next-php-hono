// ============================================
// Support / Chat Types
// ============================================

export type ConversationStatus = 'open' | 'assigned' | 'waiting' | 'resolved' | 'closed'
export type ConversationPriority = 'low' | 'medium' | 'high' | 'urgent'
export type SenderType = 'user' | 'agent' | 'system' | 'ai'

export type Conversation = {
  id: string
  userId: string
  agentId: string | null
  subject: string
  status: ConversationStatus
  priority: ConversationPriority
  rating: number | null // 1-5
  lastMessageAt: string | null
  createdAt: string
  updatedAt: string
}

export type Message = {
  id: string
  conversationId: string
  senderId: string
  senderType: SenderType
  senderName?: string
  content: string
  createdAt: string
}

export type ConversationWithMessages = Conversation & {
  messages: Message[]
}

export type CannedResponse = {
  id: string
  title: string
  content: string
  category: string | null
  shortcut: string | null
  createdBy: string
  createdAt: string
  updatedAt: string
}

export type AgentQueue = {
  unassigned: Conversation[]
  assigned: Conversation[]
  totalOpen: number
}

export type CsatRatings = {
  average: number
  total: number
  distribution: Record<number, number> // { 1: 5, 2: 3, 3: 10, 4: 20, 5: 50 }
}

export type CreateConversation = {
  subject: string
  message: string
  priority?: ConversationPriority
}

export type CreateMessage = {
  content: string
}

// ============================================
// AI Chat Types
// ============================================

export type ConversationMode = 'ai' | 'human'

export type AiMessage = {
  role: 'user' | 'assistant'
  content: string
}

export type AiProviderOption = {
  id: string
  name: string
  models: { id: string; name: string; isDefault?: boolean }[]
}
