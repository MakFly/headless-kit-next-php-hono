import { betterAuth } from 'better-auth';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { d as db } from './db_CHRX6QwF.mjs';

const auth = betterAuth({
  baseURL: "http://localhost:4321",
  secret: "dev-secret-change-me-in-production-min-32-chars!!",
  database: drizzleAdapter(db, {
    provider: "pg"
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60
    }
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "customer",
        required: false
      }
    }
  },
  trustedOrigins: [
    "http://localhost:4321"
  ]
});

export { auth };
