import { BoxIcon, CheckIcon } from 'lucide-react'

const features = [
  'Multi-backend authentication (Laravel, Symfony, Hono)',
  'Role-based access control with fine-grained permissions',
  'Production-ready ecommerce, SaaS & support presets',
  'BFF architecture with HttpOnly cookies',
]

export function AuthBranding() {
  return (
    <div
      className="relative hidden h-full flex-col justify-between overflow-hidden bg-[var(--background-deep,#0a0a0a)] p-10 lg:flex"
      style={{
        backgroundImage:
          'radial-gradient(circle, rgba(255,255,255,0.04) 1px, transparent 1px)',
        backgroundSize: '24px 24px',
      }}
    >
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 80% 80%, var(--neon-glow), transparent 60%)',
        }}
      />

      <div className="relative flex items-center gap-2.5">
        <div className="flex size-9 items-center justify-center rounded-lg bg-[var(--neon)] text-black">
          <BoxIcon className="size-5" />
        </div>
        <span className="font-mono text-xl font-semibold tracking-tight text-white">
          headless-kit
        </span>
      </div>

      <div className="relative space-y-6">
        <h1 className="max-w-md text-3xl font-bold leading-snug text-white lg:text-4xl">
          Ship faster with production-ready presets.
        </h1>
        <ul className="space-y-3">
          {features.map((f) => (
            <li
              key={f}
              className="flex items-center gap-3 text-sm text-neutral-400"
            >
              <CheckIcon className="size-4 shrink-0 text-[var(--neon)]" />
              {f}
            </li>
          ))}
        </ul>
      </div>

      <p className="relative text-xs text-neutral-500">
        &copy; {new Date().getFullYear()} Headless Kit. Open Source Starter Kit.
      </p>
    </div>
  )
}
