import { createFileRoute, redirect, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-8 bg-background p-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight">
          {{PROJECT_NAME}}
        </h1>
        <p className="mt-2 text-lg text-muted-foreground">
          Your TanStack Start app is running.
        </p>
      </div>

      <div className="flex gap-4">
        <Link
          to="/login"
          className="inline-flex h-10 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Sign In
        </Link>
        <Link
          to="/register"
          className="inline-flex h-10 items-center justify-center rounded-md border border-input bg-background px-6 text-sm font-medium hover:bg-accent hover:text-accent-foreground"
        >
          Sign Up
        </Link>
      </div>

      <div className="mt-8 text-center text-sm text-muted-foreground">
        <p>
          Built with{' '}
          <a
            href="https://tanstack.com/start"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            TanStack Start
          </a>
          {' + '}
          <a
            href="https://tailwindcss.com"
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:text-foreground"
          >
            Tailwind CSS
          </a>
        </p>
      </div>
    </div>
  )
}
