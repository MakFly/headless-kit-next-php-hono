import { CheckIcon } from 'lucide-react'
import { Link } from '@tanstack/react-router'

const tiers = [
  {
    name: 'Free',
    price: '$0',
    description: 'For individuals getting started',
    features: ['Up to 3 projects', 'Basic analytics', 'Community support', '1 team member'],
    cta: 'Get Started',
    to: '/register' as const,
    highlighted: false,
  },
  {
    name: 'Pro',
    price: '$29',
    period: '/month',
    description: 'For growing teams and businesses',
    features: [
      'Unlimited projects',
      'Advanced analytics',
      'Priority support',
      'Up to 10 team members',
      'Custom integrations',
      'API access',
    ],
    cta: 'Start Free Trial',
    to: '/register' as const,
    highlighted: true,
  },
  {
    name: 'Enterprise',
    price: 'Custom',
    description: 'For large organizations',
    features: [
      'Everything in Pro',
      'Unlimited team members',
      'SSO & SAML',
      'Dedicated support',
      'Custom SLA',
      'On-premise option',
    ],
    cta: 'Contact Sales',
    to: '/register' as const,
    highlighted: false,
  },
]

export function PricingSection() {
  return (
    <section className="py-24 px-6">
      <div className="mx-auto max-w-6xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            Choose the plan that fits your needs. Upgrade or downgrade at any time.
          </p>
        </div>
        <div className="grid gap-8 md:grid-cols-3">
          {tiers.map((tier) => (
            <div
              key={tier.name}
              className={`relative flex flex-col rounded-2xl border p-8 ${
                tier.highlighted
                  ? 'border-[var(--neon)] shadow-[0_0_30px_var(--neon-glow)]'
                  : 'border-border'
              }`}
            >
              {tier.highlighted && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2 rounded-full bg-[var(--neon)] px-4 py-1 text-xs font-semibold text-black">
                  Most Popular
                </div>
              )}
              <div className="mb-6">
                <h3 className="text-lg font-semibold">{tier.name}</h3>
                <div className="mt-2 flex items-baseline gap-1">
                  <span className="text-4xl font-bold tracking-tight">{tier.price}</span>
                  {tier.period && (
                    <span className="text-sm text-muted-foreground">{tier.period}</span>
                  )}
                </div>
                <p className="mt-2 text-sm text-muted-foreground">{tier.description}</p>
              </div>
              <ul className="mb-8 flex-1 space-y-3">
                {tier.features.map((feature) => (
                  <li key={feature} className="flex items-center gap-2 text-sm">
                    <CheckIcon className="h-4 w-4 text-[var(--neon)]" />
                    {feature}
                  </li>
                ))}
              </ul>
              <Link
                to={tier.to}
                className={`inline-flex h-10 items-center justify-center rounded-md px-6 text-sm font-medium transition-colors ${
                  tier.highlighted
                    ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                    : 'border border-input bg-background hover:bg-accent hover:text-accent-foreground'
                }`}
              >
                {tier.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
