import { Outlet, createFileRoute, redirect } from '@tanstack/react-router'
import { AuthBranding } from '@/components/auth/auth-branding'
import { BoxIcon } from 'lucide-react'

export const Route = createFileRoute('/_auth')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: AuthLayout,
})

function AuthLayout() {
  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[55%_45%]">
      <AuthBranding />
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-[var(--neon)] text-black">
              <BoxIcon className="size-4" />
            </div>
            <span className="font-mono text-lg font-semibold tracking-tight">
              headless-kit
            </span>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
