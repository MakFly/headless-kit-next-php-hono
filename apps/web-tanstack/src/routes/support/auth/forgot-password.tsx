import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const Route = createFileRoute('/support/auth/forgot-password')({
  component: SupportForgotPasswordPage,
})

function SupportForgotPasswordPage() {
  return <ForgotPasswordForm loginPath="/support" title="Reset your password" />
}
