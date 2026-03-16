export interface Permission {
  id: number
  name: string
  slug: string
  description?: string
}

export interface Role {
  id: number
  name: string
  slug: string
  description?: string
  permissions?: Permission[]
}

export interface User {
  id: number
  name: string
  email: string
  emailVerifiedAt?: string
  createdAt: string
  updatedAt: string
  roles: Role[]
}
