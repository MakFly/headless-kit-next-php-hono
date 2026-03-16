import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: HomePage,
})

function HomePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 bg-[var(--background-deep,var(--background))] p-8">
      <h1 className="font-mono text-4xl font-bold text-[var(--neon)]">
        {{PROJECT_NAME}}
      </h1>
      <p className="text-muted-foreground">
        Welcome to your admin dashboard.
      </p>
      <a
        href="/login"
        className="rounded-md bg-[var(--neon)] px-6 py-2 text-sm font-medium text-black transition-colors hover:bg-[var(--neon)]/90"
      >
        Sign In
      </a>
    </div>
  )
}
