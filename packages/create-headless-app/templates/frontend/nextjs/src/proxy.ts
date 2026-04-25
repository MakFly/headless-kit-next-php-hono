import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { createEdgeLogger } from "@/lib/logger/edge";
import {
  AUTH_BACKEND_COOKIE,
  getCookieNamesForBackend,
  normalizeBackend,
  resolveBackend,
} from "@/lib/auth/backend-context";

const log = createEdgeLogger("middleware");

/**
 * Token configuration (must match token-service.ts)
 * Note: We can't import from token-service.ts in Edge runtime,
 * so we duplicate the constants here.
 */
const TOKEN_CONFIG = {
  /** Threshold in seconds before expiration to trigger proactive refresh (5 minutes) */
  REFRESH_THRESHOLD: 5 * 60,
} as const;

/**
 * Header name to signal refresh needed to route handlers
 */
export const REFRESH_NEEDED_HEADER = "x-bff-refresh-needed";

/**
 * Cookie names (ACCESS_TOKEN configurable via AUTH_COOKIE_NAME env)
 *
 * Note: We can't import from @/lib/config/env in Edge runtime,
 * so we read process.env directly here. Keep in sync with env.ts.
 */
function getBackendFromPath(pathname: string): "laravel" | "symfony" | "node" | null {
  if (pathname.startsWith("/laravel")) return "laravel";
  if (pathname.startsWith("/symfony")) return "symfony";
  if (pathname.startsWith("/hono")) return "node";
  return null;
}

function getLoginUrl(pathname: string): string {
  if (pathname.startsWith("/saas")) return "/saas/auth/login";
  if (pathname.startsWith("/support")) return "/support/auth/login";
  if (pathname.startsWith("/shop")) return "/shop/auth/login";
  return "/dashboard/auth/login";
}

function getGroupRoot(pathname: string): string {
  if (pathname.startsWith("/shop/auth")) return "/shop";
  if (pathname.startsWith("/saas/auth")) return "/saas";
  if (pathname.startsWith("/support/auth")) return "/support";
  if (pathname.startsWith("/dashboard/auth")) return "/dashboard";
  return "/";
}

// Routes that require authentication
const protectedRoutes = ["/dashboard", "/saas", "/support"];

// Routes that should redirect to home if already authenticated
const authRoutes = [
  "/shop/auth",
  "/saas/auth",
  "/support/auth",
  "/dashboard/auth",
];

// API routes that should check for proactive refresh
const apiRoutes = ["/api/v1/", "/api/auth/"];

/**
 * Decode JWT payload without signature verification (Edge-compatible).
 * This is safe because we only extract the expiration time,
 * and the actual auth verification happens on the backend.
 */
function decodeJwtPayloadEdge(token: string): { exp?: number } | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    if (!payload) return null;

    // Base64url to base64
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");

    // Pad if necessary
    const padded = base64 + "=".repeat((4 - (base64.length % 4)) % 4);

    // Decode (atob is available in Edge runtime)
    const decoded = atob(padded);
    return JSON.parse(decoded);
  } catch {
    return null;
  }
}

/**
 * Check if token needs proactive refresh
 */
function shouldRefreshProactively(token: string): boolean {
  const payload = decodeJwtPayloadEdge(token);
  if (!payload?.exp) return false;

  const now = Math.floor(Date.now() / 1000);
  const remainingSeconds = payload.exp - now;

  // Refresh if less than threshold remaining (but not expired)
  return (
    remainingSeconds > 0 && remainingSeconds < TOKEN_CONFIG.REFRESH_THRESHOLD
  );
}

/**
 * Check if token is expired
 */
function isTokenExpired(token: string): boolean {
  const payload = decodeJwtPayloadEdge(token);
  if (!payload?.exp) return true;

  const now = Math.floor(Date.now() / 1000);
  return payload.exp <= now;
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const backendFromPath = getBackendFromPath(pathname);
  const backendFromCookie = normalizeBackend(
    request.cookies.get(AUTH_BACKEND_COOKIE)?.value,
  );
  const activeBackend = backendFromPath || resolveBackend(backendFromCookie);
  const cookieNames = getCookieNamesForBackend(activeBackend);
  const token = request.cookies.get(cookieNames.accessToken)?.value;
  const refreshToken = request.cookies.get(cookieNames.refreshToken)?.value;

  const attachBackendCookie = (response: NextResponse): NextResponse => {
    if (backendFromPath) {
      // CSRF protection: only set the backend-switching cookie when the
      // request originates from the same site. SameSite=Lax already blocks
      // cross-origin sub-resource requests, but an attacker could still
      // trigger a top-level navigation (e.g. <a href="/laravel">). Checking
      // Origin or Referer ensures we only honour same-origin navigations.
      const origin = request.headers.get("origin");
      const referer = request.headers.get("referer");
      const appUrl = request.nextUrl.origin;

      const isSameOrigin =
        (origin && origin === appUrl) ||
        (referer && referer.startsWith(appUrl));

      if (isSameOrigin) {
        response.cookies.set(AUTH_BACKEND_COOKIE, backendFromPath, {
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
          httpOnly: true,
        });
      } else {
        log.warn("Backend switch blocked: cross-origin request", {
          pathname,
          origin: origin ?? "none",
          referer: referer ?? "none",
        });
      }
    }

    return response;
  };

  // For API routes, check if proactive refresh is needed
  if (apiRoutes.some((route) => pathname.startsWith(route))) {
    const requestId = request.headers.get("x-request-id") || crypto.randomUUID();
    const response = NextResponse.next();

    // Propagate request ID to downstream handlers and back to client
    response.headers.set("x-request-id", requestId);

    if (token) {
      // Check if token needs proactive refresh
      if (shouldRefreshProactively(token)) {
        log.info("Token needs proactive refresh", {
          pathname,
          hasRefreshToken: !!refreshToken,
        });
        // Signal to route handler that refresh is needed
        response.headers.set(REFRESH_NEEDED_HEADER, "true");
      }

      // Check if token is expired but we have refresh token
      if (isTokenExpired(token) && refreshToken) {
        log.info("Token expired, refresh needed", { pathname });
        response.headers.set(REFRESH_NEEDED_HEADER, "expired");
      }
    }

    return attachBackendCookie(response);
  }

  // Auth routes must be checked BEFORE protected routes
  // (auth routes are nested under protected prefixes like /dashboard/auth/login)
  const isAuthRoute = authRoutes.some((route) => pathname.startsWith(route));

  if (isAuthRoute) {
    if (token && !isTokenExpired(token)) {
      log.debug("Redirecting authenticated user from auth page", { pathname });
      return attachBackendCookie(NextResponse.redirect(new URL(getGroupRoot(pathname), request.url)));
    }
    // Not authenticated → let them through to the auth page
    return attachBackendCookie(NextResponse.next());
  }

  // Check if trying to access protected route without token
  if (protectedRoutes.some((route) => pathname.startsWith(route))) {
    if (!token) {
      log.info("Redirecting unauthenticated user to login", { pathname });
      const loginUrl = new URL(getLoginUrl(pathname), request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return attachBackendCookie(NextResponse.redirect(loginUrl));
    }

    // If token is expired and no refresh token, redirect to login
    if (isTokenExpired(token) && !refreshToken) {
      log.info("Token expired without refresh token, redirecting to login", {
        pathname,
      });
      const loginUrl = new URL(getLoginUrl(pathname), request.url);
      loginUrl.searchParams.set("redirect", pathname);
      const response = NextResponse.redirect(loginUrl);
      // Clear invalid token
      response.cookies.delete(cookieNames.accessToken);
      response.cookies.delete(cookieNames.tokenExpiresAt);
      return attachBackendCookie(response);
    }
  }

  return attachBackendCookie(NextResponse.next());
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/saas/:path*",
    "/support/:path*",
    "/shop/auth/:path*",
    "/api/v1/:path*",
    "/laravel/:path*",
    "/symfony/:path*",
    "/hono/:path*",
  ],
};
