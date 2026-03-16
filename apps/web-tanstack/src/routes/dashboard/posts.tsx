import { createFileRoute } from '@tanstack/react-router'
import { PostsGrid } from '@/components/dashboard/posts-grid'
import { hasPermission, isAdmin } from '@/types'

export const Route = createFileRoute('/dashboard/posts')({
  loader: async () => {
    try {
      const response = await fetch('https://jsonplaceholder.typicode.com/posts?_limit=20')
      const posts = await response.json()
      return { posts }
    } catch {
      return { posts: [] }
    }
  },
  component: PostsPage,
})

function PostsPage() {
  const { posts } = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  const permissions = {
    canCreate: user ? hasPermission(user, 'posts', 'create') || isAdmin(user) : false,
    canUpdate: user ? hasPermission(user, 'posts', 'update') || isAdmin(user) : false,
    canDelete: user ? hasPermission(user, 'posts', 'delete') || isAdmin(user) : false,
  }

  return <PostsGrid posts={posts} permissions={permissions} />
}
