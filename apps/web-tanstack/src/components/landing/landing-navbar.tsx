import { Link } from '@tanstack/react-router'
import { BoxIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/theme-toggle'

export function LandingNavbar() {
  return (
    <nav className="fixed top-0 z-40 w-full border-b border-white/5 bg-background/60 backdrop-blur-xl">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="h-7 w-7 rounded-md bg-gradient-to-br from-[var(--neon)] to-indigo-600 flex items-center justify-center">
            <BoxIcon className="h-3.5 w-3.5 text-white" />
          </div>
          <span className="font-mono text-sm font-bold tracking-tight">headless-kit</span>
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" size="sm" asChild>
            <Link to="/login">Sign In</Link>
          </Button>
          <Button size="sm" className="bg-[var(--neon)] text-black hover:bg-[var(--neon)]/90" asChild>
            <Link to="/register">Get Started</Link>
          </Button>
        </div>
      </div>
    </nav>
  )
}
