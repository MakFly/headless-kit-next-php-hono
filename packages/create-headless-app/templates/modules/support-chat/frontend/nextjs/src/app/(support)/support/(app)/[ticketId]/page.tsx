'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { ConversationThread } from '@/components/support/conversation-thread';
import {
  getConversationAction,
  sendMessageAction,
  rateConversationAction,
} from '@/lib/actions/support/conversations';
import type { ConversationWithMessages, ConversationStatus, ConversationPriority } from '@/types/support';
import { StarIcon } from 'lucide-react';

const statusVariant: Record<ConversationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'default',
  assigned: 'secondary',
  waiting: 'outline',
  resolved: 'secondary',
  closed: 'outline',
};

const priorityVariant: Record<ConversationPriority, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
};

export default function ConversationDetailPage() {
  const { ticketId } = useParams<{ ticketId: string }>();
  const [conversation, setConversation] = useState<ConversationWithMessages | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [rating, setRating] = useState(0);
  const [hasRated, setHasRated] = useState(false);

  const fetchConversation = useCallback(async () => {
    try {
      const data = await getConversationAction(ticketId);
      setConversation(data);
      if (data.rating) {
        setRating(data.rating);
        setHasRated(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load conversation');
    } finally {
      setIsLoading(false);
    }
  }, [ticketId]);

  useEffect(() => {
    fetchConversation();
    const interval = setInterval(fetchConversation, 10000);
    return () => clearInterval(interval);
  }, [fetchConversation]);

  const handleSend = async (content: string) => {
    await sendMessageAction(ticketId, content);
    await fetchConversation();
  };

  const handleRate = async (stars: number) => {
    setRating(stars);
    try {
      await rateConversationAction(ticketId, stars);
      setHasRated(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit rating');
    }
  };

  const canRate =
    conversation &&
    (conversation.status === 'resolved' || conversation.status === 'closed') &&
    !hasRated;

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Conversation" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-96 w-full" />
        </div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <SiteHeader title="Conversation" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Card>
            <CardContent className="p-6 text-center text-destructive">{error}</CardContent>
          </Card>
        </div>
      </>
    );
  }

  if (!conversation) return null;

  return (
    <>
      <SiteHeader title={conversation.subject} />
      <div className="flex flex-1 flex-col p-4 lg:p-6">
        <Card className="flex flex-1 flex-col overflow-hidden">
          <CardHeader className="flex-none border-b">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">{conversation.subject}</CardTitle>
              <div className="flex items-center gap-2">
                <Badge variant={priorityVariant[conversation.priority]}>
                  {conversation.priority}
                </Badge>
                <Badge variant={statusVariant[conversation.status]}>
                  {conversation.status}
                </Badge>
              </div>
            </div>
          </CardHeader>

          <div className="flex-1 overflow-hidden">
            <ConversationThread
              conversation={conversation}
              onSendMessage={handleSend}
            />
          </div>

          {canRate && (
            <div className="flex items-center justify-center gap-2 border-t p-4 bg-muted/50">
              <span className="text-sm text-muted-foreground mr-2">Rate this conversation:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <Button
                  key={star}
                  variant="ghost"
                  size="icon"
                  onClick={() => handleRate(star)}
                  className="h-8 w-8"
                >
                  <StarIcon
                    className={`h-5 w-5 ${
                      star <= rating
                        ? 'fill-yellow-400 text-yellow-400'
                        : 'text-muted-foreground'
                    }`}
                  />
                </Button>
              ))}
            </div>
          )}

          {hasRated && (
            <div className="flex items-center justify-center gap-1 border-t p-3 bg-muted/50">
              <span className="text-sm text-muted-foreground">Your rating:</span>
              {[1, 2, 3, 4, 5].map((star) => (
                <StarIcon
                  key={star}
                  className={`h-4 w-4 ${
                    star <= rating
                      ? 'fill-yellow-400 text-yellow-400'
                      : 'text-muted-foreground'
                  }`}
                />
              ))}
            </div>
          )}
        </Card>
      </div>
    </>
  );
}
