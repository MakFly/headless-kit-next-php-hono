export type Product = {
  id: string
  name: string
  description: string
  price: number
  image: string
  category: string
  rating: number
  reviewCount: number
  inStock: boolean
  variants?: { name: string; options: string[] }[]
}

export const categories = ['All', 'Electronics', 'Clothing', 'Home & Garden', 'Sports'] as const
export type Category = (typeof categories)[number]

export const products: Product[] = [
  { id: '1', name: 'Wireless Headphones Pro', description: 'Premium noise-cancelling wireless headphones with 30-hour battery life.', price: 299.99, image: '/placeholder.svg', category: 'Electronics', rating: 4.8, reviewCount: 234, inStock: true, variants: [{ name: 'Color', options: ['Black', 'White', 'Navy'] }] },
  { id: '2', name: 'Smart Watch Ultra', description: 'Advanced fitness tracking, GPS, and health monitoring.', price: 449.99, image: '/placeholder.svg', category: 'Electronics', rating: 4.6, reviewCount: 189, inStock: true },
  { id: '3', name: 'Organic Cotton T-Shirt', description: 'Sustainably sourced organic cotton tee with a relaxed fit.', price: 34.99, image: '/placeholder.svg', category: 'Clothing', rating: 4.5, reviewCount: 567, inStock: true, variants: [{ name: 'Size', options: ['S', 'M', 'L', 'XL'] }, { name: 'Color', options: ['White', 'Black', 'Sage'] }] },
  { id: '4', name: 'Minimalist Desk Lamp', description: 'Adjustable LED desk lamp with wireless charging base.', price: 79.99, image: '/placeholder.svg', category: 'Home & Garden', rating: 4.7, reviewCount: 142, inStock: true },
  { id: '5', name: 'Running Shoes Air', description: 'Lightweight running shoes with responsive cushioning.', price: 129.99, image: '/placeholder.svg', category: 'Sports', rating: 4.4, reviewCount: 892, inStock: true, variants: [{ name: 'Size', options: ['8', '9', '10', '11', '12'] }] },
  { id: '6', name: 'Ceramic Plant Pot Set', description: 'Set of 3 handcrafted ceramic pots in earth tones.', price: 49.99, image: '/placeholder.svg', category: 'Home & Garden', rating: 4.9, reviewCount: 78, inStock: true },
  { id: '7', name: 'Bluetooth Speaker Mini', description: 'Portable waterproof speaker with 360° sound.', price: 59.99, image: '/placeholder.svg', category: 'Electronics', rating: 4.3, reviewCount: 445, inStock: true },
  { id: '8', name: 'Wool Blend Sweater', description: 'Premium merino wool blend sweater.', price: 89.99, image: '/placeholder.svg', category: 'Clothing', rating: 4.6, reviewCount: 203, inStock: false },
  { id: '9', name: 'Yoga Mat Premium', description: 'Extra thick non-slip yoga mat with alignment lines.', price: 69.99, image: '/placeholder.svg', category: 'Sports', rating: 4.8, reviewCount: 321, inStock: true },
  { id: '10', name: 'Scented Candle Set', description: 'Set of 4 natural soy wax candles in seasonal scents.', price: 39.99, image: '/placeholder.svg', category: 'Home & Garden', rating: 4.7, reviewCount: 156, inStock: true },
  { id: '11', name: 'Fitness Tracker Band', description: 'Slim fitness band with heart rate monitor.', price: 49.99, image: '/placeholder.svg', category: 'Electronics', rating: 4.2, reviewCount: 678, inStock: true },
  { id: '12', name: 'Denim Jacket Classic', description: 'Vintage-wash denim jacket with sherpa lining.', price: 119.99, image: '/placeholder.svg', category: 'Clothing', rating: 4.5, reviewCount: 334, inStock: true },
]

export function getProduct(id: string): Product | undefined {
  return products.find((p) => p.id === id)
}

export function getProductsByCategory(category: Category): Product[] {
  if (category === 'All') return products
  return products.filter((p) => p.category === category)
}

export function formatPrice(price: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(price)
}
