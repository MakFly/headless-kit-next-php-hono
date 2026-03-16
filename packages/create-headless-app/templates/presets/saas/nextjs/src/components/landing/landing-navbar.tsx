import Link from 'next/link'
import { ShieldIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          <ShieldIcon className="size-6 text-[var(--neon)]" />
          <span className="font-mono text-lg font-bold tracking-tight">RBAC Panel</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link href="/auth/login">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-[var(--neon)] text-black hover:bg-[var(--neon)]/90" asChild>
            <Link href="/auth/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
