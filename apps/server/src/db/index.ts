import { drizzle } from "drizzle-orm/node-postgres";
import { logger } from "../utils/logger";
import { relations } from "./relations";
import { schema } from "./schema";

export const db = drizzle({
  connection: {
    connectionString: process.env.DATABASE_URL,
  },
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
