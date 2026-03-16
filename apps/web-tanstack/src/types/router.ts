import type { User } from '@/types'
import type { QueryClient } from '@tanstack/react-query'

export type RouterContext = {
  user: User | null
  expiresIn?: number | null
  queryClient?: QueryClient
}
