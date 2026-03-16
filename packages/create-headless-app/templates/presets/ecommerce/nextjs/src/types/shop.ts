// ============================================
// Ecommerce Types
// ============================================

export type Category = {
  id: string
  name: string
  slug: string
  description: string | null
  imageUrl: string | null
  parentId: string | null
  sortOrder: number
  productCount?: number
  createdAt: string
  updatedAt: string
}

export type Product = {
  id: string
  name: string
  slug: string
  description: string | null
  price: number // in cents
  compareAtPrice: number | null
  sku: string | null
  stockQuantity: number
  categoryId: string | null
  category?: Pick<Category, 'id' | 'name' | 'slug'>
  imageUrl: string | null
  images: string[]
  status: ProductStatus
  featured: boolean
  createdAt: string
  updatedAt: string
}

export type ProductStatus = 'active' | 'draft' | 'archived'

export type ProductFilters = {
  category?: string
  search?: string
  sort?: 'price_asc' | 'price_desc' | 'name_asc' | 'newest'
  minPrice?: number
  maxPrice?: number
  page?: number
  perPage?: number
}

export type PaginatedResponse<T> = {
  data: T[]
  pagination: {
    page: number
    perPage: number
    total: number
    totalPages: number
  }
}

export type CartItem = {
  id: string
  productId: string
  product?: Product
  quantity: number
  createdAt: string
}

export type Cart = {
  id: string
  userId: string
  items: CartItem[]
  total: number // computed, in cents
}

export type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded'

export type OrderItem = {
  id: string
  productId: string
  productName: string // snapshot
  productPrice: number // snapshot, cents
  quantity: number
  subtotal: number // cents
}

export type Order = {
  id: string
  userId: string
  status: OrderStatus
  total: number // cents
  shippingAddress: ShippingAddress | null
  paymentStatus: PaymentStatus
  notes: string | null
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

export type ShippingAddress = {
  street: string
  city: string
  state: string
  zip: string
  country: string
}

export type Customer = {
  id: string
  userId: string | null
  firstName: string
  lastName: string
  email: string
  phone: string | null
  address: ShippingAddress | null
  segment: string | null
  totalSpent: number // cents
  nbOrders: number
  lastOrderAt: string | null
  createdAt: string
}

export type Review = {
  id: string
  productId: string
  product?: Pick<Product, 'id' | 'name' | 'slug'>
  customerId: string
  customer?: Pick<Customer, 'id' | 'firstName' | 'lastName'>
  rating: number // 1-5
  comment: string | null
  status: ReviewStatus
  createdAt: string
}

export type ReviewStatus = 'pending' | 'approved' | 'rejected'

export type Segment = {
  id: string
  name: string
  slug: string
  customerCount: number
}

export type AdminDashboard = {
  monthlyRevenue: number
  nbNewOrders: number
  newCustomers: number
  pendingOrders: number
  pendingReviews: number
  orderChart: { date: string; count: number; revenue: number }[]
}

export type RevenueAnalytics = {
  totalRevenue: number
  revenueByMonth: { month: string; revenue: number }[]
}

export type TopProduct = {
  product: Pick<Product, 'id' | 'name' | 'slug' | 'imageUrl'>
  totalSold: number
  totalRevenue: number
}

export type InventoryItem = {
  productId: string
  product: Pick<Product, 'id' | 'name' | 'slug' | 'sku' | 'imageUrl'>
  stockQuantity: number
  status: 'in_stock' | 'low_stock' | 'out_of_stock'
}
