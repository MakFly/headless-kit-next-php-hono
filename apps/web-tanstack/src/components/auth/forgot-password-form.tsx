import { useState } from 'react'
import { Link } from '@tanstack/react-router'
import { ArrowLeft, Mail } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { AuthBranding } from '@/components/auth/auth-branding'

type ForgotPasswordFormProps = {
  loginPath: string
  title?: string
}

export function ForgotPasswordForm({ loginPath, title = 'Forgot password' }: ForgotPasswordFormProps) {
  const [email, setEmail] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    setError(null)

    try {
      // TODO: implement forgot-password server function
      await new Promise((resolve) => setTimeout(resolve, 1000))
      setIsSubmitted(true)
    } catch {
      setError('Failed to send reset email. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <AuthBranding />
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <Mail className="h-6 w-6 text-primary" />
            </div>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardFooter className="flex justify-center">
            <Link to={loginPath}>
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

  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <AuthBranding />
          <CardTitle>{title}</CardTitle>
          <CardDescription>
            Enter your email and we&apos;ll send you a reset link
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            {error && (
              <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
                {error}
              </div>
            )}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </CardContent>
          <CardFooter className="flex flex-col gap-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? 'Sending...' : 'Send reset link'}
            </Button>
            <Link to={loginPath}>
              <Button variant="ghost" size="sm" type="button">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to login
              </Button>
            </Link>
          </CardFooter>
        </form>
      </Card>
    </div>
  )
}
