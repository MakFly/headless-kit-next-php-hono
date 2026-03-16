import Link from 'next/link'
import { ArrowRightIcon, ShieldCheckIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function HeroSection() {
  return (
    <section className="relative flex min-h-[90vh] flex-col items-center justify-center px-6 pt-16 text-center">
      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 fill-mode-both">
        <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-[var(--neon)]/20 bg-[var(--neon)]/5 px-4 py-1.5 text-sm text-[var(--neon)]">
          <ShieldCheckIcon className="size-4" />
          Role-Based Access Control
        </div>
      </div>

      <h1
        className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-150 fill-mode-both max-w-4xl font-mono text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl"
        style={{ textShadow: '0 0 40px var(--neon-glow)' }}
      >
        Secure your app with{' '}
        <span className="text-[var(--neon)]">fine-grained</span>{' '}
        permissions
      </h1>

      <p className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300 fill-mode-both mt-6 max-w-2xl text-lg text-muted-foreground">
        A production-ready boilerplate with multi-backend authentication,
        role-based access control, and a modern dark-first dashboard.
      </p>

      <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-500 fill-mode-both mt-10 flex items-center gap-4">
        <Button
          size="lg"
          className="bg-[var(--neon)] text-black font-semibold hover:bg-[var(--neon)]/90 hover:shadow-[0_0_24px_var(--neon-glow)]"
          asChild
        >
          <Link href="/auth/register">
            Get Started
            <ArrowRightIcon className="ml-2 size-4" />
          </Link>
        </Button>
        <Button variant="outline" size="lg" asChild>
          <Link href="/auth/login">Sign In</Link>
        </Button>
      </div>
    </section>
  )
}
