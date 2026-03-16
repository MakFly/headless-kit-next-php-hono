'use client';

import { useEffect, useState } from 'react';
import { SiteHeader } from '@/components/site-header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import {
  getCannedResponsesAction,
  createCannedResponseAction,
  updateCannedResponseAction,
  deleteCannedResponseAction,
} from '@/lib/actions/support/canned';
import type { CannedResponse } from '@/types/support';
import { PlusIcon, PencilIcon, TrashIcon } from 'lucide-react';

type FormData = {
  title: string;
  content: string;
  category: string;
  shortcut: string;
};

const emptyForm: FormData = { title: '', content: '', category: '', shortcut: '' };

export default function CannedResponsesPage() {
  const [responses, setResponses] = useState<CannedResponse[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);

  const fetchResponses = async () => {
    setIsLoading(true);
    try {
      const data = await getCannedResponsesAction();
      setResponses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load canned responses');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchResponses();
  }, []);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (response: CannedResponse) => {
    setEditingId(response.id);
    setForm({
      title: response.title,
      content: response.content,
      category: response.category ?? '',
      shortcut: response.shortcut ?? '',
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.title.trim() || !form.content.trim()) return;
    setActionLoading(true);
    try {
      const payload = {
        title: form.title.trim(),
        content: form.content.trim(),
        category: form.category.trim() || undefined,
        shortcut: form.shortcut.trim() || undefined,
      };
      if (editingId) {
        await updateCannedResponseAction(editingId, payload);
      } else {
        await createCannedResponseAction(payload);
      }
      setDialogOpen(false);
      setForm(emptyForm);
      setEditingId(null);
      await fetchResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    setActionLoading(true);
    try {
      await deleteCannedResponseAction(id);
      await fetchResponses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete');
    } finally {
      setActionLoading(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <SiteHeader title="Canned Responses" />
        <div className="flex flex-1 flex-col gap-4 p-4 lg:p-6">
          <Skeleton className="h-64 w-full" />
        </div>
      </>
    );
  }

  return (
    <>
      <SiteHeader title="Canned Responses" />
      <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6">
        {error && (
          <Card>
            <CardContent className="p-4 text-destructive">{error}</CardContent>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold">Canned Responses ({responses.length})</h2>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogTrigger asChild>
              <Button onClick={openCreate}>
                <PlusIcon className="mr-2 h-4 w-4" />
                New Response
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{editingId ? 'Edit' : 'Create'} Canned Response</DialogTitle>
                <DialogDescription>
                  {editingId ? 'Update' : 'Create a new'} quick reply template.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cr-title">Title</Label>
                  <Input
                    id="cr-title"
                    value={form.title}
                    onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))}
                    placeholder="e.g., Greeting"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cr-content">Content</Label>
                  <Textarea
                    id="cr-content"
                    value={form.content}
                    onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))}
                    placeholder="The response text..."
                    rows={4}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="cr-category">Category</Label>
                    <Input
                      id="cr-category"
                      value={form.category}
                      onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
                      placeholder="e.g., General"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cr-shortcut">Shortcut</Label>
                    <Input
                      id="cr-shortcut"
                      value={form.shortcut}
                      onChange={(e) => setForm((f) => ({ ...f, shortcut: e.target.value }))}
                      placeholder="e.g., /greet"
                    />
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setDialogOpen(false)}>
                  Cancel
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={actionLoading || !form.title.trim() || !form.content.trim()}
                >
                  {actionLoading ? 'Saving...' : editingId ? 'Update' : 'Create'}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Title</TableHead>
                  <TableHead>Content</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Shortcut</TableHead>
                  <TableHead className="w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {responses.map((resp) => (
                  <TableRow key={resp.id}>
                    <TableCell className="font-medium">{resp.title}</TableCell>
                    <TableCell className="max-w-[200px] truncate text-muted-foreground">
                      {resp.content}
                    </TableCell>
                    <TableCell>
                      {resp.category && (
                        <Badge variant="outline">{resp.category}</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {resp.shortcut && (
                        <code className="text-xs bg-muted px-1 py-0.5 rounded">
                          {resp.shortcut}
                        </code>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEdit(resp)}
                          disabled={actionLoading}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button variant="ghost" size="icon" disabled={actionLoading}>
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete canned response?</AlertDialogTitle>
                              <AlertDialogDescription>
                                This will permanently delete &quot;{resp.title}&quot;. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction onClick={() => handleDelete(resp.id)}>
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {responses.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-muted-foreground">
                      No canned responses yet
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
