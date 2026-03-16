import { createFileRoute, redirect } from '@tanstack/react-router'
import { OnboardingForm } from '@/components/saas/onboarding-form'

export const Route = createFileRoute('/saas/onboarding')({
  beforeLoad: ({ context }) => {
    if (!context.user) throw redirect({ to: '/login' })
  },
  component: OnboardingPage,
})

function OnboardingPage() {
  return (
    <div className="max-w-lg mx-auto pt-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create your organization</h1>
        <p className="text-muted-foreground mt-1">
          Set up your organization to get started with the SaaS features.
        </p>
      </div>
      <OnboardingForm />
    </div>
  )
}
