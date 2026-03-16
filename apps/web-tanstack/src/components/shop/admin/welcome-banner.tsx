import { Link } from '@tanstack/react-router'
import { Code, House } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'

export function WelcomeBanner() {
  return (
    <Card className="flex flex-row px-4 mb-4">
      <div className="flex-1 py-4">
        <h1 className="text-xl font-bold mb-2">Welcome to the shop admin</h1>
        <p className="text-muted-foreground text-sm">
          Manage your e-commerce store, track orders, monitor reviews, and grow
          your business.
        </p>
        <div className="flex gap-2 mt-4">
          <Link
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            to="/shop"
          >
            <House className="size-4 mr-1" />
            View Shop
          </Link>
          <Link
            className={buttonVariants({ variant: 'outline', size: 'sm' })}
            to="/shop/admin/products"
          >
            <Code className="size-4 mr-1" />
            Manage Products
          </Link>
        </div>
      </div>
      <div className="hidden md:flex items-center justify-center w-64 ml-auto">
        <div className="w-48 h-28 rounded-lg bg-gradient-to-br from-muted to-muted/50" />
      </div>
    </Card>
  )
}
