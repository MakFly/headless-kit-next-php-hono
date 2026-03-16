import { Link, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { Menu, Search, ShoppingBag, User, X } from 'lucide-react'
import { SearchSuggestions } from './search-suggestions'
import { CartSheet } from './cart-sheet'
import type { User as UserType } from '@/types'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useCartStore } from '@/stores/cart-store'
import { useAuthStore } from '@/stores/auth-store'
import { isAdmin } from '@/types'

type ShopNavbarProps = {
  initialUser?: UserType | null
}

const navLinks = [
  { label: 'Shop All', href: '/shop' },
  { label: 'New In', href: '/shop?sort=newest' },
  { label: 'Clothing', href: '/shop/categories/clothing' },
  { label: 'Beauty', href: '/shop/categories/beauty' },
]

const mobileLinks = [
  ...navLinks,
  { label: 'My Orders', href: '/shop/orders' },
  { label: 'Cart', href: '/shop/cart' },
]

export function ShopNavbar({ initialUser }: ShopNavbarProps) {
  const navigate = useNavigate()
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [cartOpen, setCartOpen] = useState(false)

  const { user: storeUser, isHydrated, logout } = useAuthStore()
  const user = isHydrated ? storeUser : initialUser
  const itemCount = useCartStore((s) => s.itemCount)

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-stone-200 bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-14 items-center justify-between">
            {/* Left: mobile hamburger + desktop nav */}
            <div className="flex items-center gap-6">
              <Button
                variant="ghost"
                size="icon"
                className="-ml-2 text-stone-700 hover:text-stone-900 lg:hidden"
                onClick={() => setMobileOpen((v) => !v)}
                aria-label="Toggle menu"
              >
                {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
              </Button>

              <nav className="hidden items-center gap-8 lg:flex">
                {navLinks.map((link) => (
                  <Link
                    key={link.href + link.label}
                    to={link.href}
                    className="text-[11px] tracking-[0.15em] uppercase text-stone-600 transition-colors hover:text-stone-900"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>

            {/* Center: brand */}
            <Link to="/shop" className="absolute left-1/2 -translate-x-1/2">
              <span className="text-xl tracking-[0.35em] font-light uppercase text-stone-900">
                Maison
              </span>
            </Link>

            {/* Right: actions */}
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="text-stone-600 hover:text-stone-900"
                onClick={() => setSearchOpen((v) => !v)}
                aria-label="Search"
              >
                <Search className="h-[18px] w-[18px]" />
              </Button>

              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-stone-600 hover:text-stone-900"
                    >
                      <User className="h-[18px] w-[18px]" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="w-48 rounded-none border-stone-200"
                  >
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col gap-0.5">
                        <p className="text-sm font-medium text-stone-900">
                          {user.name}
                        </p>
                        <p className="truncate text-xs text-stone-500">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator className="bg-stone-100" />
                    <DropdownMenuItem asChild className="text-xs tracking-wide">
                      <Link to="/shop/orders">My Orders</Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild className="text-xs tracking-wide">
                      <Link to="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                    {isAdmin(user) && (
                      <DropdownMenuItem asChild className="text-xs tracking-wide">
                        <Link to="/shop/admin">Admin Dashboard</Link>
                      </DropdownMenuItem>
                    )}
                    <DropdownMenuSeparator className="bg-stone-100" />
                    <DropdownMenuItem
                      className="text-xs tracking-wide text-stone-500"
                      onClick={async () => { await logout(); navigate({ to: '/shop/auth/login' }) }}
                    >
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-stone-600 hover:text-stone-900"
                  asChild
                >
                  <Link to="/shop/auth/login" aria-label="Sign in">
                    <User className="h-[18px] w-[18px]" />
                  </Link>
                </Button>
              )}

              <Button
                variant="ghost"
                size="icon"
                className="relative text-stone-600 hover:text-stone-900"
                onClick={() => setCartOpen(true)}
              >
                <ShoppingBag className="h-[18px] w-[18px]" />
                {itemCount > 0 && (
                  <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-stone-900 text-[9px] text-white">
                    {itemCount > 99 ? '99' : itemCount}
                  </span>
                )}
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Search overlay — rendered outside header to avoid clipping */}
      {searchOpen && <SearchSuggestions onClose={() => setSearchOpen(false)} />}

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-white p-6 shadow-xl">
            <div className="mt-12 flex flex-col gap-6">
              {mobileLinks.map((link) => (
                <Link
                  key={link.href + link.label}
                  to={link.href}
                  className="text-[11px] tracking-[0.2em] uppercase text-stone-600 transition-colors hover:text-stone-900"
                  onClick={() => setMobileOpen(false)}
                >
                  {link.label}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <CartSheet open={cartOpen} onOpenChange={setCartOpen} />
    </>
  )
}
