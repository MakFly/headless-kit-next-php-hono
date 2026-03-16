'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationList } from '@/components/support/conversation-list';
import { getConversationsAction } from '@/lib/actions/support/conversations';
import type { Conversation } from '@/types/support';
import { Bot } from 'lucide-react';

export default function SupportPage() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    setIsLoading(true);
    try {
      const data = await getConversationsAction();
      setConversations(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversations');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <>
      <SiteHeader title="Support" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error && (
          <Card>
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">My Conversations</h2>
          <Button asChild>
            <Link href="/support/c">
              <Bot className="mr-2 h-4 w-4" />
              New AI Chat
            </Link>
          </Button>
        </div>

        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : (
          <ConversationList conversations={conversations} />
        )}
      </div>
    </>
  );
}
