'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  getAgentQueueAction,
  assignConversationAction,
  updateConversationStatusAction,
} from '@/lib/actions/support/agent';
import type { Conversation, ConversationStatus, ConversationPriority } from '@/types/support';
import Link from 'next/link';

const priorityVariant: Record<ConversationPriority, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  low: 'outline',
  medium: 'secondary',
  high: 'default',
  urgent: 'destructive',
};

const statusVariant: Record<ConversationStatus, 'default' | 'secondary' | 'outline' | 'destructive'> = {
  open: 'default',
  assigned: 'secondary',
  waiting: 'outline',
  resolved: 'secondary',
  closed: 'outline',
};

export default function AgentDashboardPage() {
  const [unassigned, setUnassigned] = useState<Conversation[]>([]);
  const [assigned, setAssigned] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchQueue = async () => {
    setIsLoading(true);
    try {
      const data = await getAgentQueueAction();
      setUnassigned(data.unassigned);
      setAssigned(data.assigned);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load queue');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchQueue();
    const interval = setInterval(fetchQueue, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleAssign = async (conversationId: string) => {
    setActionLoading(true);
    try {
      await assignConversationAction(conversationId);
      await fetchQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to assign');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (conversationId: string, status: ConversationStatus) => {
    setActionLoading(true);
    try {
      await updateConversationStatusAction(conversationId, status);
      await fetchQueue();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Agent Dashboard" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <Skeleton className="h-64" />
            <Skeleton className="h-64" />
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Agent Dashboard" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error && (
          <Card>
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="grid gap-6 lg:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Queue</span>
                <Badge variant="outline">{unassigned.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {unassigned.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No unassigned conversations</p>
              ) : (
                unassigned.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center">
                        <Link href={`/support/${conv.id}`} className="font-medium text-sm hover:underline truncate">
                          {conv.subject}
                        </Link>
                        {conv.subject.includes('Escalated from AI') && (
                          <Badge variant="outline" className="ml-2 shrink-0 text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityVariant[conv.priority]} className="text-xs">
                        {conv.priority}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        disabled={actionLoading}
                        onClick={() => handleAssign(conv.id)}
                      >
                        Assign to me
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>My Assigned</span>
                <Badge variant="outline">{assigned.length}</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {assigned.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No assigned conversations</p>
              ) : (
                assigned.map((conv) => (
                  <div key={conv.id} className="flex items-center justify-between border rounded-lg p-3">
                    <div className="flex-1 min-w-0 mr-3">
                      <div className="flex items-center">
                        <Link href={`/support/${conv.id}`} className="font-medium text-sm hover:underline truncate">
                          {conv.subject}
                        </Link>
                        {conv.subject.includes('Escalated from AI') && (
                          <Badge variant="outline" className="ml-2 shrink-0 text-[10px] px-1.5 py-0 bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800">
                            AI
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        {new Date(conv.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={priorityVariant[conv.priority]} className="text-xs">
                        {conv.priority}
                      </Badge>
                      <Select
                        defaultValue={conv.status}
                        onValueChange={(v) => handleStatusChange(conv.id, v as ConversationStatus)}
                        disabled={actionLoading}
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="assigned">Assigned</SelectItem>
                          <SelectItem value="waiting">Waiting</SelectItem>
                          <SelectItem value="resolved">Resolved</SelectItem>
                          <SelectItem value="closed">Closed</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
