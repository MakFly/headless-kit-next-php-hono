import { createFileRoute } from '@tanstack/react-router'
import { TodosTable } from '@/components/dashboard/todos-table'

export const Route = createFileRoute('/dashboard/todos')({
  loader: async ({ context }) => {
    const userId = context.user?.id ?? 1
    try {
      const response = await fetch(
        `https://jsonplaceholder.typicode.com/todos?userId=${userId}&_limit=20`,
      )
      const todos = await response.json()
      return { todos }
    } catch {
      return { todos: [] }
    }
  },
  component: TodosPage,
})

function TodosPage() {
  const { todos } = Route.useLoaderData()
  const { user } = Route.useRouteContext()

  return <TodosTable todos={todos} userId={user?.id ?? 1} />
}
