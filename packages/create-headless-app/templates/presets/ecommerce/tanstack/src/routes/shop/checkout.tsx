import { createFileRoute } from '@tanstack/react-router'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CreditCardIcon } from 'lucide-react'

export const Route = createFileRoute('/shop/checkout')({
  component: CheckoutPage,
})

function CheckoutPage() {
  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Checkout</h2>
        <p className="text-muted-foreground">
          Complete your purchase.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCardIcon className="size-5" />
            Checkout
            <Badge variant="secondary">Coming Soon</Badge>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            Checkout page will handle shipping address, payment method, and order confirmation.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
