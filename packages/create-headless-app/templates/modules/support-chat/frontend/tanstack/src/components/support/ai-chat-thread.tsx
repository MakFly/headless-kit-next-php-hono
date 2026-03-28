import { useMemo } from 'react'
import { DefaultChatTransport } from 'ai'
import { useChatRuntime } from '@assistant-ui/react-ai-sdk'
import { AssistantRuntimeProvider } from '@assistant-ui/react'
import { Thread } from '@/components/assistant-ui/thread'
import { ThreadList } from '@/components/assistant-ui/thread-list'
import { ModelSelector } from '@/components/support/model-selector'
import { EscalationBanner } from '@/components/support/escalation-banner'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { SidebarTrigger } from '@/components/ui/sidebar'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { useAiPreferencesStore } from '@/stores/ai-preferences-store'
import { useAuthStore } from '@/stores/auth-store'

type AiChatThreadProps = {
  threadId?: string
}

export function AiChatThread({ threadId }: AiChatThreadProps) {
  const { selectedProvider, selectedModel } = useAiPreferencesStore()
  const { user, isHydrated } = useAuthStore()

  const transport = useMemo(
    () =>
      new DefaultChatTransport({
        api: '/api/ai/chat',
        body: {
          provider: selectedProvider,
          model: selectedModel,
          ...(threadId ? { threadId } : {}),
        },
      }),
    [selectedProvider, selectedModel, threadId],
  )

  const runtime = useChatRuntime({ transport })

  const getInitials = (name?: string) => {
    if (!name) return 'U'
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <div className="flex h-full w-full gap-4 p-4">
        {/* ThreadList panel */}
        <aside className="hidden w-64 shrink-0 lg:flex">
          <Card className="flex w-full flex-col overflow-hidden">
            <div className="border-b px-3 py-2.5">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Conversations
              </h3>
            </div>
            <div className="flex-1 overflow-y-auto p-2">
              <ThreadList />
            </div>
          </Card>
        </aside>

        {/* Chat area */}
        <div className="flex min-w-0 flex-1 flex-col gap-4">
          {/* Header */}
          <header className="flex h-10 shrink-0 items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="data-[orientation=vertical]:h-4"
            />
            <span className="text-base font-semibold tracking-tight">
              AI Support Chat
            </span>
            <div className="ml-auto flex items-center gap-3">
              <ModelSelector />
              {!isHydrated ? (
                <Skeleton className="h-8 w-8 rounded-full" />
              ) : user ? (
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-gradient-to-br from-violet-600 to-indigo-600 text-xs font-semibold text-white">
                    {getInitials(user.name)}
                  </AvatarFallback>
                </Avatar>
              ) : null}
            </div>
          </header>

          {/* Thread content */}
          <Card className="flex min-h-0 flex-1 flex-col overflow-hidden">
            <div className="min-h-0 flex-1">
              <Thread />
            </div>
            <EscalationBanner />
          </Card>
        </div>
      </div>
    </AssistantRuntimeProvider>
  )
}
