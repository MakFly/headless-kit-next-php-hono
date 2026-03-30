import Stripe from "stripe"

export const stripe = new Stripe(import.meta.env.STRIPE_SECRET_KEY || "", {
  apiVersion: "2025-04-30.basil",
})

export const PLANS = {
  pro: {
    name: "Pro",
    price: 7900, // cents
    priceId: import.meta.env.STRIPE_PRO_PRICE_ID || "",
  },
  business: {
    name: "Business",
    price: 19900, // cents
    priceId: import.meta.env.STRIPE_BUSINESS_PRICE_ID || "",
  },
} as const

export type PlanTier = keyof typeof PLANS
