/**
 * E2E Auth tests for the Headless Kit site.
 * Requires: server running on localhost:4321 + db:reset done.
 *
 * Run: bun test tests/auth.test.ts
 */

import { describe, it, expect, beforeAll } from "bun:test"

const BASE = process.env.SITE_URL || "http://localhost:4321"

async function signIn(email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/sign-in/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
    redirect: "manual",
  })
  return res
}

async function signUp(name: string, email: string, password: string) {
  const res = await fetch(`${BASE}/api/auth/sign-up/email`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, email, password }),
    redirect: "manual",
  })
  return res
}

async function getSession(cookie: string) {
  const res = await fetch(`${BASE}/api/auth/get-session`, {
    headers: { Cookie: cookie },
  })
  return res
}

function extractCookie(res: Response): string {
  const cookies = res.headers.getSetCookie()
  return cookies.map((c) => c.split(";")[0]).join("; ")
}

describe("Auth - Sign In", () => {
  it("should sign in with valid admin credentials", async () => {
    const res = await signIn("admin@headlesskit.dev", "admin123!")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe("admin@headlesskit.dev")
    expect(body.user.role).toBe("admin")
  })

  it("should sign in with valid customer credentials", async () => {
    const res = await signIn("customer@headlesskit.dev", "customer123!")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe("customer@headlesskit.dev")
    expect(body.user.role).toBe("customer")
  })

  it("should return a session cookie on sign in", async () => {
    const res = await signIn("admin@headlesskit.dev", "admin123!")
    expect(res.status).toBe(200)

    const cookies = res.headers.getSetCookie()
    expect(cookies.length).toBeGreaterThan(0)
    expect(cookies.some((c) => c.includes("better-auth"))).toBe(true)
  })

  it("should reject invalid password", async () => {
    const res = await signIn("admin@headlesskit.dev", "wrongpassword")
    expect(res.status).toBeGreaterThanOrEqual(400)
  })

  it("should reject non-existent email", async () => {
    const res = await signIn("nobody@headlesskit.dev", "whatever123")
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe("Auth - Sign Up", () => {
  it("should create a new account", async () => {
    const email = `test-${Date.now()}@headlesskit.dev`
    const res = await signUp("Test User", email, "testpass123!")
    expect(res.status).toBe(200)

    const body = await res.json()
    expect(body.user).toBeDefined()
    expect(body.user.email).toBe(email)
    expect(body.user.name).toBe("Test User")
    expect(body.user.role).toBe("customer")
  })

  it("should reject duplicate email", async () => {
    const res = await signUp("Admin Dup", "admin@headlesskit.dev", "testpass123!")
    expect(res.status).toBeGreaterThanOrEqual(400)
  })

  it("should reject short password", async () => {
    const email = `short-${Date.now()}@headlesskit.dev`
    const res = await signUp("Short Pass", email, "123")
    expect(res.status).toBeGreaterThanOrEqual(400)
  })
})

describe("Auth - Session", () => {
  it("should return session for authenticated user", async () => {
    const signInRes = await signIn("admin@headlesskit.dev", "admin123!")
    expect(signInRes.status).toBe(200)

    const cookie = extractCookie(signInRes)
    expect(cookie).toBeTruthy()

    const sessionRes = await getSession(cookie)
    expect(sessionRes.status).toBe(200)

    const session = await sessionRes.json()
    expect(session.user).toBeDefined()
    expect(session.user.email).toBe("admin@headlesskit.dev")
  })

  it("should not return user for unauthenticated request", async () => {
    const res = await getSession("")
    // better-auth may return null body or { user: null }
    if (res.status === 200) {
      const body = await res.json()
      expect(body?.user ?? null).toBeNull()
    } else {
      expect(res.status).toBeGreaterThanOrEqual(400)
    }
  })
})

describe("Protected Routes", () => {
  it("should redirect /dashboard to login when unauthenticated", async () => {
    const res = await fetch(`${BASE}/dashboard`, { redirect: "manual" })
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toContain("/auth/login")
  })

  it("should redirect /admin to /dashboard", async () => {
    const res = await fetch(`${BASE}/admin`, { redirect: "manual" })
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toContain("/dashboard")
  })

  it("should allow admin to access /dashboard/admin/users", async () => {
    const signInRes = await signIn("admin@headlesskit.dev", "admin123!")
    const cookie = extractCookie(signInRes)

    const res = await fetch(`${BASE}/dashboard/admin/users`, {
      headers: { Cookie: cookie },
      redirect: "manual",
    })
    expect(res.status).toBe(200)
  })

  it("should redirect customer from /dashboard/admin/users to /dashboard", async () => {
    const signInRes = await signIn("customer@headlesskit.dev", "customer123!")
    const cookie = extractCookie(signInRes)

    const res = await fetch(`${BASE}/dashboard/admin/users`, {
      headers: { Cookie: cookie },
      redirect: "manual",
    })
    expect(res.status).toBe(302)
    expect(res.headers.get("location")).toContain("/dashboard")
  })

  it("should allow customer to access /dashboard", async () => {
    const signInRes = await signIn("customer@headlesskit.dev", "customer123!")
    const cookie = extractCookie(signInRes)

    const res = await fetch(`${BASE}/dashboard`, {
      headers: { Cookie: cookie },
      redirect: "manual",
    })
    expect(res.status).toBe(200)
  })
})
