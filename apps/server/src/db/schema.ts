import { sql } from "drizzle-orm";
import { bytea, pgTable, timestamp, uuid, varchar } from "drizzle-orm/pg-core";

const uuidv7pk = uuid().primaryKey().default(sql`uuidv7()`);

const timestamps = {
  createdAt: timestamp().notNull().defaultNow(),
  updatedAt: timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

export const users = pgTable("users", {
  userId: uuidv7pk,
  email: varchar().notNull().unique(),
  passwordHash: varchar().notNull(),
  ...timestamps,
});

export const sessions = pgTable("sessions", {
  sessionId: varchar().primaryKey(),
  secretHash: bytea().notNull(),
  userId: uuid()
    .notNull()
    .references(() => users.userId),
  createdAt: timestamps.createdAt,
});

export const schema = {
  users,
  sessions,
};
