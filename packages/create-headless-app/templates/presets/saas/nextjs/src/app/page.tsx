'use client';

import { LandingNavbar } from '@/components/landing/landing-navbar';
import { HeroSection } from '@/components/landing/hero-section';
import { FeaturesGrid } from '@/components/landing/features-grid';
import { PricingSection } from '@/components/landing/pricing-section';
import { TechStack } from '@/components/landing/tech-stack';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-[var(--background-deep,var(--background))]">
      <LandingNavbar />
      <HeroSection />
      <FeaturesGrid />
      <PricingSection />
      <TechStack />
      <footer className="border-t border-border py-8 text-center text-sm text-muted-foreground">
        <p>{'{{PROJECT_NAME}}'} — Built with Headless Kit</p>
      </footer>
    </div>
  );
}
