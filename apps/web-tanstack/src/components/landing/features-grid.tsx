import { Link } from '@tanstack/react-router'
import {
  ChevronRightIcon,
  HeadphonesIcon,
  RocketIcon,
  ShoppingBagIcon,
} from 'lucide-react'

const presets = [
  {
    id: 'shop',
    name: 'Ecommerce',
    href: '/shop',
    icon: ShoppingBagIcon,
    accentClass: 'text-emerald-400',
    borderClass: 'border-emerald-500/20 hover:border-emerald-500/40',
    glowClass: 'hover:shadow-[0_0_24px_rgba(16,185,129,0.1)]',
    bgClass: 'bg-emerald-500/10',
    gradientClass: 'from-emerald-500 to-teal-500',
    description:
      'Product catalog, cart, checkout, orders. Admin dashboard with analytics, inventory, and reviews.',
    features: ['Product CRUD', 'Cart & Checkout', 'Order Management', 'Admin Analytics'],
  },
  {
    id: 'saas',
    name: 'SaaS',
    href: '/saas',
    icon: RocketIcon,
    accentClass: 'text-blue-400',
    borderClass: 'border-blue-500/20 hover:border-blue-500/40',
    glowClass: 'hover:shadow-[0_0_24px_rgba(59,130,246,0.1)]',
    bgClass: 'bg-blue-500/10',
    gradientClass: 'from-blue-500 to-cyan-500',
    description:
      'Multi-tenant dashboard with billing, team management, usage analytics, and org settings.',
    features: ['Billing & Plans', 'Team Invites', 'Usage Quotas', 'Org Settings'],
  },
  {
    id: 'support',
    name: 'Support',
    href: '/support',
    icon: HeadphonesIcon,
    accentClass: 'text-orange-400',
    borderClass: 'border-orange-500/20 hover:border-orange-500/40',
    glowClass: 'hover:shadow-[0_0_24px_rgba(249,115,22,0.1)]',
    bgClass: 'bg-orange-500/10',
    gradientClass: 'from-orange-500 to-amber-500',
    description:
      'Real-time chat support with agent queue, canned responses, CSAT ratings, and conversation management.',
    features: ['Live Chat', 'Agent Dashboard', 'Canned Responses', 'CSAT Ratings'],
  },
]

export function FeaturesGrid() {
  return (
    <section className="mx-auto max-w-6xl px-6 py-24">
      <div className="mb-14">
        <p className="font-mono text-xs text-muted-foreground/60 uppercase tracking-widest mb-3">
          Modules
        </p>
        <h2 className="font-mono text-3xl sm:text-4xl font-bold tracking-tight">
          Three presets, infinite possibilities
        </h2>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        {presets.map((preset) => (
          <Link key={preset.id} to={preset.href}>
            <div
              className={`group rounded-xl border ${preset.borderClass} bg-card/50 p-6 backdrop-blur-sm transition-all duration-500 ${preset.glowClass} cursor-pointer h-full flex flex-col`}
            >
              <div className="flex items-start justify-between mb-5">
                <div
                  className={`h-11 w-11 rounded-xl bg-gradient-to-br ${preset.gradientClass} flex items-center justify-center shadow-lg`}
                >
                  <preset.icon className="h-5 w-5 text-white" />
                </div>
                <ChevronRightIcon className="h-4 w-4 text-muted-foreground/30 group-hover:text-muted-foreground/70 transition-all group-hover:translate-x-0.5" />
              </div>

              <h3 className="font-mono text-xl font-bold mb-1.5">{preset.name}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                {preset.description}
              </p>

              <div className="flex flex-wrap gap-1.5">
                {preset.features.map((f) => (
                  <span
                    key={f}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${preset.bgClass} ${preset.accentClass}`}
                  >
                    {f}
                  </span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </section>
  )
}
