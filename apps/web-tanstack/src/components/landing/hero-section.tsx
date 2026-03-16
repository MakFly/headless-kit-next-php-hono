import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, BoxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-16 text-center">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <Badge
          variant="outline"
          className="border-[var(--neon)]/20 bg-[var(--neon)]/5 px-4 py-1.5 text-sm text-[var(--neon)] font-mono"
        >
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400 mr-2 animate-pulse" />
          v1.0 — 3 backends, 3 presets, 2 frontends
        </Badge>
      </div>

      <h1
        className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both mt-8 max-w-4xl font-mono text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl leading-[1.05]"
      >
        Ship faster with{' '}
        <span
          className="text-[var(--neon)]"
          style={{ textShadow: '0 0 40px var(--neon-glow)' }}
        >
          production presets
        </span>
      </h1>

      <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both mt-6 max-w-2xl text-lg text-muted-foreground">
        A headless starter kit with ecommerce, SaaS, and support modules — pre-wired
        to Laravel, Symfony, or Hono. Pick a preset, choose a backend, start building.
      </p>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both mt-10 flex items-center gap-4">
        <Button
          size="lg"
          className="bg-[var(--neon)] text-black font-semibold hover:bg-[var(--neon)]/90 hover:shadow-[0_0_24px_var(--neon-glow)]"
          asChild
        >
          <Link to="/register">
            Start Building
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link to="/shop">Browse Shop Demo</Link>
        </Button>
      </div>
    </section>
  )
}
