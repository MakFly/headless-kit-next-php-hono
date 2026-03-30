import { defineMiddleware } from "astro:middleware"

const PUBLIC_PATHS = ["/", "/fr", "/docs", "/api/webhooks", "/api/auth"]

const AUTH_PATHS = ["/auth/login", "/auth/register", "/dashboard"]

const SITE_MODE = import.meta.env.PUBLIC_SITE_MODE || "development"
const IS_PRODUCTION_MODE = SITE_MODE === "production"

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))) return true
  if (pathname.startsWith("/_")) return true
  if (pathname.match(/\.(css|js|svg|png|jpg|ico|woff2?)$/)) return true
  return false
}

function isAuthPath(pathname: string): boolean {
  return AUTH_PATHS.some((p) => pathname === p || pathname.startsWith(p + "/"))
}

function stripLocalePrefix(pathname: string): string {
  if (pathname.startsWith("/fr/")) return pathname.slice(3) || "/"
  if (pathname === "/fr") return "/"
  return pathname
}

export const onRequest = defineMiddleware(async (context, next) => {
  const { pathname } = context.url
  const canonicalPath = stripLocalePrefix(pathname)
  const localePrefix = pathname.startsWith("/fr") ? "/fr" : ""

  if (IS_PRODUCTION_MODE && isAuthPath(canonicalPath)) {
    return context.redirect(localePrefix + "/")
  }

  if (isPublicPath(canonicalPath)) {
    context.locals.user = null
    context.locals.session = null
    return next()
  }

  const { auth } = await import("./lib/auth")

  try {
    const session = await auth.api.getSession({
      headers: context.request.headers,
    })

    if (session) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context.locals.user = session.user as any
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      context.locals.session = session.session as any
    } else {
      context.locals.user = null
      context.locals.session = null
    }
  } catch {
    context.locals.user = null
    context.locals.session = null
  }

  if (canonicalPath.startsWith("/auth/") && context.locals.user) {
    return context.redirect(localePrefix + "/dashboard")
  }

  if (canonicalPath.startsWith("/admin")) {
    return context.redirect(localePrefix + "/dashboard")
  }

  if (canonicalPath.startsWith("/dashboard")) {
    if (!context.locals.user) {
      return context.redirect(localePrefix + "/auth/login?redirect=" + encodeURIComponent(pathname))
    }
  }

  return next()
})
