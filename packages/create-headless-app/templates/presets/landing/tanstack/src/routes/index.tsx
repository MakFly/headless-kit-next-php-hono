import { createFileRoute, redirect } from '@tanstack/react-router'
import { GrainOverlay } from '@/components/landing/grain-overlay'
import { LandingNavbar } from '@/components/landing/landing-navbar'
import { HeroSection } from '@/components/landing/hero-section'
import { FeaturesGrid } from '@/components/landing/features-grid'
import { TechStack } from '@/components/landing/tech-stack'

export const Route = createFileRoute('/')({
  beforeLoad: ({ context }) => {
    if (context.user) {
      throw redirect({ to: '/dashboard' })
    }
  },
  component: LandingPage,
})

function LandingPage() {
  return (
    <div className="min-h-screen bg-[var(--background-deep,var(--background))]">
      <GrainOverlay />
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <TechStack />
      <footer className="border-t border-white/5 py-8 text-center text-sm text-muted-foreground">
        <p>{{PROJECT_NAME}} &mdash; Built with Headless Kit</p>
      </footer>
    </div>
  )
}
