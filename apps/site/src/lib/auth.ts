import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db } from "./db"

export const auth = betterAuth({
  baseURL: import.meta.env.SITE_URL || process.env.SITE_URL || "http://localhost:4321",
  secret: import.meta.env.BETTER_AUTH_SECRET || process.env.BETTER_AUTH_SECRET || "dev-secret-change-me-in-production-min-32-chars!!",
  database: drizzleAdapter(db, {
    provider: "pg",
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false,
      },
    },
  },
  trustedOrigins: [
    import.meta.env.SITE_URL || process.env.SITE_URL || "http://localhost:4321",
  ],
})
