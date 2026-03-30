export const prerender = false

import type { APIRoute } from "astro"
import { auth } from "@/lib/auth"

const handler: APIRoute = async (ctx) => {
  return auth.handler(ctx.request)
}

export const GET = handler
export const POST = handler
export const PUT = handler
export const PATCH = handler
export const DELETE = handler
