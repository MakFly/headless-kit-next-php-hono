import { Link } from '@tanstack/react-router'
import { Separator } from '@/components/ui/separator'

const footerLinks = {
  Shop: [
    { label: 'New Arrivals', href: '/shop?sort=newest' },
    { label: 'Dresses', href: '/shop/categories/dresses' },
    { label: 'Tops & Shirts', href: '/shop/categories/shirts' },
    { label: 'Skincare', href: '/shop/categories/skincare' },
    { label: 'Fragrances', href: '/shop/categories/fragrances' },
  ],
  Help: [
    { label: 'Shipping & Returns', href: '#' },
    { label: 'Size Guide', href: '#' },
    { label: 'Contact Us', href: '#' },
    { label: 'FAQ', href: '#' },
  ],
  Account: [
    { label: 'Sign In', href: '/shop/auth/login' },
    { label: 'Register', href: '/shop/auth/register' },
    { label: 'My Orders', href: '/shop/orders' },
    { label: 'Wishlist', href: '#' },
  ],
  Company: [
    { label: 'About Maison', href: '#' },
    { label: 'Sustainability', href: '#' },
    { label: 'Careers', href: '#' },
    { label: 'Press', href: '#' },
  ],
}

export function ShopFooter() {
  return (
    <footer className="border-t border-stone-200 bg-stone-50">
      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-20 lg:px-8">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="col-span-2 lg:col-span-1">
            <Link to="/shop">
              <span className="text-lg tracking-[0.35em] font-light uppercase text-stone-900">
                Maison
              </span>
            </Link>
            <p className="mt-4 max-w-[220px] text-xs leading-relaxed text-stone-500">
              Curated fashion and beauty essentials for the modern individual.
            </p>
          </div>

          {/* Link columns */}
          {Object.entries(footerLinks).map(([section, links]) => (
            <div key={section}>
              <h3 className="mb-4 text-[10px] tracking-[0.2em] font-medium uppercase text-stone-900">
                {section}
              </h3>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link.href + link.label}>
                    <Link
                      to={link.href}
                      className="text-xs text-stone-500 transition-colors hover:text-stone-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="my-10 bg-stone-200" />

        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <p className="text-[10px] tracking-wider uppercase text-stone-400">
            &copy; {new Date().getFullYear()} Maison. All rights reserved.
          </p>
          <div className="flex items-center gap-6">
            {['Privacy', 'Terms', 'Cookies'].map((item) => (
              <Link
                key={item}
                to="#"
                className="text-[10px] tracking-wider uppercase text-stone-400 transition-colors hover:text-stone-900"
              >
                {item}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
