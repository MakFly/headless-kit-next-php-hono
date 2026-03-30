/// <reference path="../.astro/types.d.ts" />

declare namespace App {
  interface Locals {
    user: {
      id: string
      email: string
      name: string
      image?: string | null
      role?: string
    } | null
    session: {
      id: string
      userId: string
      expiresAt: Date
    } | null
  }
}
