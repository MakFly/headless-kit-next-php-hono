import { useEffect, useState } from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthBranding } from '@/components/auth/auth-branding'
import { ResetPasswordForm } from '@/components/auth/reset-password-form'
import { verifyResetTokenFn } from '@/lib/server/auth'

type ResetPasswordSearch = {
  token?: string
}

export const Route = createFileRoute('/_auth/reset-password')({
  validateSearch: (search: Record<string, unknown>): ResetPasswordSearch => ({
    token: typeof search['token'] === 'string' ? search['token'] : undefined,
  }),
  component: ResetPasswordPage,
})

function ResetPasswordPage() {
  const { token } = Route.useSearch()
  const [isVerifying, setIsVerifying] = useState(true)
  const [isValid, setIsValid] = useState(false)

  useEffect(() => {
    if (!token) {
      setIsVerifying(false)
      setIsValid(false)
      return
    }

    verifyResetTokenFn({ data: { token } })
      .then((result) => {
        setIsValid(result.valid)
      })
      .catch(() => {
        setIsValid(false)
      })
      .finally(() => {
        setIsVerifying(false)
      })
  }, [token])

  if (isVerifying) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AuthBranding />
            <CardDescription>Verifying your reset link...</CardDescription>
          </CardHeader>
        </Card>
      </div>
    )
  }

  if (!token || !isValid) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AuthBranding />
            <CardTitle>Invalid or expired link</CardTitle>
            <CardDescription>
              This password reset link is invalid or has expired. Please request a new one.
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex flex-col gap-4">
            <Link to="/forgot-password">
              <Button className="w-full">Request new link</Button>
            </Link>
            <Link to="/login">
              <Button variant="ghost" size="sm">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </div>
    )
  }

  return <ResetPasswordForm token={token} loginPath="/login" />
}
