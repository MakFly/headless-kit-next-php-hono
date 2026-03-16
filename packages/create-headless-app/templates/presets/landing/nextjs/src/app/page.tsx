'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/stores/auth-store'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { TechStack } from '@/components/landing/tech-stack'
import { GrainOverlay } from '@/components/landing/grain-overlay'

export default function LandingPage() {
  const router = useRouter()
  const user = useAuthStore((s) => s.user)

  useEffect(() => {
    if (user) {
      router.push('/dashboard')
    }
  }, [user, router])

  if (user) return null

  return (
    <div className="relative min-h-screen bg-[var(--background-deep)]">
      <GrainOverlay />
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <TechStack />

      <footer className="border-t border-white/5 py-8 text-center text-sm text-muted-foreground">
        <p>Built with Next.js, Tailwind CSS, and shadcn/ui</p>
      </footer>
    </div>
  )
}
