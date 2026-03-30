import { drizzle } from "drizzle-orm/postgres-js"
import postgres from "postgres"
import * as schema from "../db/schema"

const connectionString = import.meta.env.DATABASE_URL || "postgres://headless:headless@localhost:5432/headless_site"

const client = postgres(connectionString)

export const db = drizzle(client, { schema })
