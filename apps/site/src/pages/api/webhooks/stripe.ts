import type { APIRoute } from "astro"
import { stripe } from "@/lib/stripe"
import { createLicense } from "@/lib/license"
import type { PlanTier } from "@/lib/stripe"

export const prerender = false

export const POST: APIRoute = async ({ request }) => {
  const signature = request.headers.get("stripe-signature")
  if (!signature) {
    return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const webhookSecret = import.meta.env.STRIPE_WEBHOOK_SECRET
  if (!webhookSecret) {
    console.error("STRIPE_WEBHOOK_SECRET is not configured")
    return new Response(JSON.stringify({ error: "Webhook not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }

  let event
  try {
    const rawBody = await request.text()
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret)
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error"
    console.error("Webhook signature verification failed:", message)
    return new Response(JSON.stringify({ error: "Invalid signature" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object
    const tier = session.metadata?.tier as PlanTier | undefined
    const userId = session.metadata?.userId

    if (!tier || !userId) {
      console.error("Webhook missing metadata:", { tier, userId, sessionId: session.id })
      return new Response(JSON.stringify({ error: "Missing metadata" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    try {
      await createLicense({
        userId,
        tier,
        stripeSessionId: session.id,
        stripeCustomerId: session.customer as string | undefined,
      })
      console.info(`License created: tier=${tier}, userId=${userId}, session=${session.id}`)
    } catch (err) {
      console.error("Failed to create license:", err)
      return new Response(JSON.stringify({ error: "License creation failed" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }
  }

  return new Response(JSON.stringify({ received: true }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  })
}
