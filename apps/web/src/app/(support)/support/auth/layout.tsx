import { cookies } from "next/headers"
import { redirect } from "next/navigation"
import { Headset, Check } from "lucide-react"

const features = [
  "Real-time customer chat support",
  "Agent queue and assignment management",
  "Canned responses for faster replies",
  "Customer satisfaction ratings and analytics",
]

export default async function SupportAuthLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies()
  const hasAuth =
    cookieStore.get("auth_token")?.value ||
    cookieStore.get("laravel_auth_token")?.value ||
    cookieStore.get("symfony_auth_token")?.value

  if (hasAuth) {
    redirect("/support")
  }

  return (
    <div className="grid min-h-screen grid-cols-1 lg:grid-cols-[55%_45%]">
      {/* Left: branding panel */}
      <div className="auth-panel-bg relative hidden h-full flex-col justify-between overflow-hidden p-10 lg:flex">
        <div className="auth-glow pointer-events-none absolute inset-0" />

        {/* Logo */}
        <div className="relative flex items-center gap-2">
          <div className="flex size-9 items-center justify-center rounded-lg bg-orange-600 text-white">
            <Headset className="size-5" />
          </div>
          <span className="text-xl font-semibold tracking-tight text-white">
            Support Center
          </span>
        </div>

        {/* Tagline + Features */}
        <div className="relative space-y-6">
          <h1 className="max-w-md text-3xl font-bold leading-snug text-white lg:text-4xl">
            Deliver exceptional customer support, effortlessly.
          </h1>
          <ul className="space-y-3">
            {features.map((feature) => (
              <li key={feature} className="flex items-center gap-3 text-sm text-neutral-400">
                <Check className="size-4 shrink-0 text-orange-400" />
                {feature}
              </li>
            ))}
          </ul>
        </div>

        {/* Footer */}
        <p className="relative text-xs text-neutral-500">
          &copy; {new Date().getFullYear()} Support Center. Headless Kit.
        </p>
      </div>

      {/* Right: form */}
      <div className="flex items-center justify-center p-6">
        <div className="w-full max-w-[420px]">
          {/* Mobile logo */}
          <div className="mb-8 flex items-center gap-2 lg:hidden">
            <div className="flex size-8 items-center justify-center rounded-lg bg-orange-600 text-white">
              <Headset className="size-4" />
            </div>
            <span className="text-lg font-semibold tracking-tight">
              Support Center
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
