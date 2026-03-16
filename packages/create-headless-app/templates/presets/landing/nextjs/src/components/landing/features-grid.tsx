import { ShieldIcon, UsersIcon, KeyIcon, LockIcon } from 'lucide-react'

const features = [
  {
    icon: ShieldIcon,
    title: 'Role-Based Access',
    description: 'Define roles with granular permissions. Admin, moderator, user — fully customizable.',
  },
  {
    icon: UsersIcon,
    title: 'Multi-Backend Auth',
    description: 'Swap between Laravel, Symfony, or Node.js backends with a single env variable.',
  },
  {
    icon: KeyIcon,
    title: 'Secure by Default',
    description: 'HttpOnly cookies, secure API proxy, CSRF protection built-in.',
  },
  {
    icon: LockIcon,
    title: 'BFF Architecture',
    description: 'Backend-for-Frontend pattern keeps tokens server-side. Zero exposure to the client.',
  },
]

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <h2 className="mb-12 text-center font-mono text-3xl font-bold tracking-tight">
        Built for <span className="text-[var(--neon)]">security</span>
      </h2>
      <div className="grid gap-6 sm:grid-cols-2">
        {features.map((feature) => (
          <div
            key={feature.title}
            className="group rounded-xl border border-[var(--neon-muted)]/20 bg-card/50 p-6 backdrop-blur-sm transition-all hover:border-[var(--neon-muted)]/40 hover:shadow-[0_0_24px_var(--neon-glow)]"
          >
            <feature.icon className="mb-4 size-8 text-[var(--neon)] transition-transform group-hover:scale-110" />
            <h3 className="mb-2 font-mono text-lg font-semibold">{feature.title}</h3>
            <p className="text-sm text-muted-foreground">{feature.description}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
