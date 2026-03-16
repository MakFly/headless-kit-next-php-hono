import { createFileRoute } from '@tanstack/react-router'
import { ForgotPasswordForm } from '@/components/auth/forgot-password-form'

export const Route = createFileRoute('/shop/auth/forgot-password')({
  component: ShopForgotPasswordPage,
})

function ShopForgotPasswordPage() {
  return <ForgotPasswordForm loginPath="/shop" title="Reset your shop password" />
}
