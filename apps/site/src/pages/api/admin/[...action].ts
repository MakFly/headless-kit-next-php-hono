export const prerender = false

import type { APIRoute } from "astro"
import { updateUserRole, deleteUser, killSession, killAllSessions, getUserByEmail } from "@/lib/admin"
import { revokeLicense, reactivateLicense, extendLicense, createManualLicense } from "@/lib/license"
import type { PlanTier } from "@/lib/stripe"

function json(data: Record<string, unknown>, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

export const POST: APIRoute = async ({ params, request, locals }) => {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const user = locals.user as any
  if (!user || user.role !== "admin") {
    return json({ success: false, message: "Unauthorized" }, 403)
  }

  const action = params.action
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let body: Record<string, any> = {}
  try {
    body = await request.json()
  } catch {
    return json({ success: false, message: "Invalid JSON body" }, 400)
  }

  try {
    switch (action) {
      // ── User actions ──
      case "users/role": {
        const { userId, role } = body
        if (!userId || !role || !["admin", "customer"].includes(role)) {
          return json({ success: false, message: "Invalid userId or role" }, 400)
        }
        await updateUserRole(userId, role)
        return json({ success: true, message: `Role updated to ${role}` })
      }

      case "users/delete": {
        const { userId } = body
        if (!userId) return json({ success: false, message: "userId required" }, 400)
        if (userId === user.id) return json({ success: false, message: "Cannot delete yourself" }, 400)
        await deleteUser(userId)
        return json({ success: true, message: "User deleted" })
      }

      // ── License actions ──
      case "licenses/revoke": {
        const { licenseId } = body
        if (!licenseId) return json({ success: false, message: "licenseId required" }, 400)
        await revokeLicense(licenseId)
        return json({ success: true, message: "License revoked" })
      }

      case "licenses/reactivate": {
        const { licenseId } = body
        if (!licenseId) return json({ success: false, message: "licenseId required" }, 400)
        await reactivateLicense(licenseId)
        return json({ success: true, message: "License reactivated" })
      }

      case "licenses/extend": {
        const { licenseId, months = 12 } = body
        if (!licenseId) return json({ success: false, message: "licenseId required" }, 400)
        await extendLicense(licenseId, months)
        return json({ success: true, message: `License extended by ${months} months` })
      }

      case "licenses/create": {
        const { email, tier, lifetime } = body
        if (!email || !tier || !["pro", "business"].includes(tier)) {
          return json({ success: false, message: "Valid email and tier required" }, 400)
        }
        const targetUser = await getUserByEmail(email)
        if (!targetUser) return json({ success: false, message: "User not found" }, 404)

        const expiresAt = lifetime ? null : new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        const license = await createManualLicense({
          userId: targetUser.id,
          tier: tier as PlanTier,
          expiresAt,
        })
        return json({ success: true, message: "License created", license })
      }

      // ── Session actions ──
      case "sessions/kill": {
        const { sessionId } = body
        if (!sessionId) return json({ success: false, message: "sessionId required" }, 400)
        await killSession(sessionId)
        return json({ success: true, message: "Session killed" })
      }

      case "sessions/kill-all": {
        await killAllSessions()
        return json({ success: true, message: "All sessions killed" })
      }

      default:
        return json({ success: false, message: `Unknown action: ${action}` }, 404)
    }
  } catch (err) {
    console.error(`Admin action ${action} failed:`, err)
    return json({ success: false, message: "Internal server error" }, 500)
  }
}
