import { useState, useTransition } from 'react'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import {
  FileTextIcon,
  PlusIcon,
  EditIcon,
  TrashIcon,
  EyeIcon,
  LockIcon,
  UserIcon,
} from 'lucide-react'

type Post = {
  id: number
  userId: number
  title: string
  body: string
}

type PostsGridProps = {
  posts: Post[]
  permissions: {
    canCreate: boolean
    canUpdate: boolean
    canDelete: boolean
  }
}

const API_BASE = 'https://jsonplaceholder.typicode.com'

export function PostsGrid({ posts, permissions }: PostsGridProps) {
  const [isPending, startTransition] = useTransition()
  const [localPosts, setLocalPosts] = useState<Post[]>(posts)
  const [selectedPost, setSelectedPost] = useState<Post | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [editDialogOpen, setEditDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [viewDialogOpen, setViewDialogOpen] = useState(false)

  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')

  const resetForm = () => {
    setTitle('')
    setBody('')
  }

  const handleCreate = () => {
    startTransition(async () => {
      const response = await fetch(`${API_BASE}/posts`, {
        method: 'POST',
        body: JSON.stringify({ userId: 1, title, body }),
        headers: { 'Content-Type': 'application/json' },
      })
      const created = await response.json()
      setLocalPosts([{ ...created, userId: 1 }, ...localPosts])
      setCreateDialogOpen(false)
      resetForm()
    })
  }

  const handleUpdate = () => {
    if (!selectedPost) return
    startTransition(async () => {
      const response = await fetch(`${API_BASE}/posts/${selectedPost.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ title, body }),
        headers: { 'Content-Type': 'application/json' },
      })
      const updated = await response.json()
      setLocalPosts(localPosts.map((p) => (p.id === selectedPost.id ? { ...p, ...updated } : p)))
      setEditDialogOpen(false)
      resetForm()
    })
  }

  const handleDelete = () => {
    if (!selectedPost) return
    startTransition(async () => {
      await fetch(`${API_BASE}/posts/${selectedPost.id}`, { method: 'DELETE' })
      setLocalPosts(localPosts.filter((p) => p.id !== selectedPost.id))
      setDeleteDialogOpen(false)
      setSelectedPost(null)
    })
  }

  const openEditDialog = (post: Post) => {
    setSelectedPost(post)
    setTitle(post.title)
    setBody(post.body)
    setEditDialogOpen(true)
  }

  const openViewDialog = (post: Post) => {
    setSelectedPost(post)
    setViewDialogOpen(true)
  }

  const openDeleteDialog = (post: Post) => {
    setSelectedPost(post)
    setDeleteDialogOpen(true)
  }

  return (
    <>
      {/* Header avec permissions */}
      <Card className="mb-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <FileTextIcon className="h-5 w-5" />
                Posts
              </CardTitle>
              <CardDescription>
                {localPosts.length} posts loaded from JSONPlaceholder API
              </CardDescription>
            </div>
            <div className="flex items-center gap-2">
              {/* Permission badges */}
              <div className="flex gap-1">
                <Badge variant={permissions.canCreate ? 'default' : 'secondary'}>
                  {permissions.canCreate ? 'Create' : <LockIcon className="h-3 w-3" />}
                </Badge>
                <Badge variant={permissions.canUpdate ? 'default' : 'secondary'}>
                  {permissions.canUpdate ? 'Update' : <LockIcon className="h-3 w-3" />}
                </Badge>
                <Badge variant={permissions.canDelete ? 'destructive' : 'secondary'}>
                  {permissions.canDelete ? 'Delete' : <LockIcon className="h-3 w-3" />}
                </Badge>
              </div>

              {/* Create button */}
              {permissions.canCreate && (
                <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>
                      <PlusIcon className="mr-2 h-4 w-4" />
                      New Post
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Post</DialogTitle>
                      <DialogDescription>
                        Create a new post (simulated via JSONPlaceholder)
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Title</label>
                        <Input
                          value={title}
                          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                          placeholder="Enter post title..."
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Content</label>
                        <Textarea
                          value={body}
                          onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                          placeholder="Enter post content..."
                          rows={5}
                        />
                      </div>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreate} disabled={isPending || !title}>
                        {isPending ? 'Creating...' : 'Create Post'}
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Posts Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {localPosts.map((post) => (
          <Card key={post.id} className="group hover:shadow-lg transition-all duration-300">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <Badge variant="outline" className="mb-2">
                  <UserIcon className="mr-1 h-3 w-3" />
                  User {post.userId}
                </Badge>
                <Badge variant="secondary">#{post.id}</Badge>
              </div>
              <CardTitle className="text-base line-clamp-2">{post.title}</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground line-clamp-3">{post.body}</p>
            </CardContent>
            <CardFooter className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => openViewDialog(post)}>
                <EyeIcon className="mr-1 h-4 w-4" />
                View
              </Button>
              {permissions.canUpdate && (
                <Button variant="ghost" size="sm" onClick={() => openEditDialog(post)}>
                  <EditIcon className="mr-1 h-4 w-4" />
                  Edit
                </Button>
              )}
              {permissions.canDelete && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-destructive hover:text-destructive"
                  onClick={() => openDeleteDialog(post)}
                >
                  <TrashIcon className="mr-1 h-4 w-4" />
                  Delete
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* View Dialog */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPost?.title}</DialogTitle>
            <DialogDescription>
              Post #{selectedPost?.id} by User {selectedPost?.userId}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <p className="text-sm whitespace-pre-wrap">{selectedPost?.body}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Post</DialogTitle>
            <DialogDescription>
              Update post #{selectedPost?.id} (simulated)
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={title}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setTitle(e.target.value)}
                placeholder="Enter post title..."
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={body}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setBody(e.target.value)}
                placeholder="Enter post content..."
                rows={5}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={isPending || !title}>
              {isPending ? 'Updating...' : 'Update Post'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Post?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete &quot;{selectedPost?.title}&quot;? This action
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isPending ? 'Deleting...' : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
