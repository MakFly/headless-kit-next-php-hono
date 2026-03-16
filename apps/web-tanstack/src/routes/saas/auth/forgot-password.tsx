import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const Route = createFileRoute('/saas/auth/forgot-password')({
  component: SaasForgotPasswordPage,
})

function SaasForgotPasswordPage() {
  return <ForgotPasswordForm loginPath="/saas" title="Reset your password" />
}
