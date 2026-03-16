import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import { LayoutDashboard, Check } from 'lucide-react'

const features = [
  "Multi-backend authentication (Laravel, Symfony, Hono)",
  "Role-based access control with fine-grained permissions",
  "Production-ready ecommerce, SaaS & support presets",
  "BFF architecture with HttpOnly cookies",
]

export default async function DashboardAuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const hasAuth =
    cookieStore.get('auth_token')?.value ||
    cookieStore.get('laravel_auth_token')?.value ||
    cookieStore.get('symfony_auth_token')?.value

  if (hasAuth) {
    redirect('/dashboard')
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[55%_45%]">
      <div className="auth-panel-bg relative hidden h-full flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="auth-glow pointer-events-none absolute inset-0" />

        <div className="relative flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
            <LayoutDashboard className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Dashboard
          </span>
        </div>

        <div className="relative space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-snug text-white lg:text-4xl">
            Ship faster with production-ready presets.
          </h1>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-neutral-400">
                <Check className="size-4 shrink-0 text-violet-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        <p className="relative text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Headless Kit. Open Source Starter Kit.
        </p>
      </div>

      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 text-white">
              <LayoutDashboard className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Dashboard
            </span>
          </div>
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {children}
          </div>
        </div>
      </div>
    </div>
  )
}
