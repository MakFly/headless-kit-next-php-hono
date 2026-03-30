import type { APIRoute } from "astro"
import { stripe, PLANS, type PlanTier } from "@/lib/stripe"

export const prerender = false

export const POST: APIRoute = async ({ locals, request }) => {
  const user = locals.user
  if (!user) {
    return new Response(JSON.stringify({ error: "Authentication required" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    })
  }

  let body: { tier?: string }
  try {
    body = await request.json()
  } catch {
    return new Response(JSON.stringify({ error: "Invalid request body" }), {
      status: 400,
      headers: { "Content-Type": "application/json" },
    })
  }

  const tier = body.tier as PlanTier
  if (!tier || !(tier in PLANS)) {
    return new Response(
      JSON.stringify({ error: "Invalid tier. Must be 'pro' or 'business'" }),
      { status: 400, headers: { "Content-Type": "application/json" } },
    )
  }

  const plan = PLANS[tier]
  const siteUrl = import.meta.env.SITE_URL || "http://localhost:4321"

  try {
    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      payment_method_types: ["card"],
      customer_email: user.email,
      line_items: [
        {
          price_data: {
            currency: "usd",
            product_data: {
              name: `Headless Kit — ${plan.name}`,
              description: `One-time purchase of Headless Kit ${plan.name} license`,
            },
            unit_amount: plan.price,
          },
          quantity: 1,
        },
      ],
      metadata: {
        tier,
        userId: user.id,
      },
      success_url: `${siteUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${siteUrl}/#pricing`,
    })

    return new Response(JSON.stringify({ url: session.url }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    console.error("Stripe checkout error:", err)
    return new Response(
      JSON.stringify({ error: "Failed to create checkout session" }),
      { status: 500, headers: { "Content-Type": "application/json" } },
    )
  }
}
