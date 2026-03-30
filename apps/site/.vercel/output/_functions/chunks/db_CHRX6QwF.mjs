import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { pgTable, timestamp, text, boolean } from 'drizzle-orm/pg-core';
import { randomBytes } from 'crypto';

function createId() {
  return randomBytes(12).toString("hex");
}
function generateLicenseKey() {
  const segments = Array.from(
    { length: 4 },
    () => randomBytes(4).toString("hex").toUpperCase()
  );
  return `HK-${segments.join("-")}`;
}

const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("emailVerified").notNull().default(false),
  image: text("image"),
  role: text("role").default("customer"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});
const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expiresAt").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow(),
  ipAddress: text("ipAddress"),
  userAgent: text("userAgent"),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" })
});
const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("accountId").notNull(),
  providerId: text("providerId").notNull(),
  userId: text("userId").notNull().references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("accessToken"),
  refreshToken: text("refreshToken"),
  idToken: text("idToken"),
  accessTokenExpiresAt: timestamp("accessTokenExpiresAt"),
  refreshTokenExpiresAt: timestamp("refreshTokenExpiresAt"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("createdAt").notNull().defaultNow(),
  updatedAt: timestamp("updatedAt").notNull().defaultNow()
});
const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expiresAt").notNull(),
  createdAt: timestamp("createdAt"),
  updatedAt: timestamp("updatedAt")
});
const licenses = pgTable("licenses", {
  id: text("id").primaryKey().$defaultFn(createId),
  userId: text("user_id").notNull(),
  tier: text("tier", { enum: ["pro", "business"] }).notNull(),
  licenseKey: text("license_key").notNull().unique(),
  stripeSessionId: text("stripe_session_id"),
  stripeCustomerId: text("stripe_customer_id"),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().defaultNow(),
  expiresAt: timestamp("expires_at")
});

const schema = /*#__PURE__*/Object.freeze(/*#__PURE__*/Object.defineProperty({
  __proto__: null,
  account,
  licenses,
  session,
  user,
  verification
}, Symbol.toStringTag, { value: 'Module' }));

const connectionString = "postgres://headless:headless@localhost:5432/headless_site";
const client = postgres(connectionString);
const db = drizzle(client, { schema });

export { db as d, generateLicenseKey as g, licenses as l, session as s, user as u };
