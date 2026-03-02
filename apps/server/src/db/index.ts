import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { logger } from "../utils/logger";
import { relations } from "./relations";
import { schema } from "./schema";

export const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export const db = drizzle({
  client: pool,
  casing: "snake_case",
  schema,
  relations,
  logger: {
    logQuery(query, params) {
      logger.debug({ query, params }, "Database query");
    },
  },
});

export type Database = typeof db;
export type DatabaseTransaction = Parameters<
  Parameters<Database["transaction"]>[0]
>[0];
export type DatabaseConnection = Database | DatabaseTransaction;
