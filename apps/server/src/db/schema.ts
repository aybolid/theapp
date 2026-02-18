import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

const uuidv7pk = pg.uuid().primaryKey().default(sql`uuidv7()`);

const timestamps = {
  createdAt: pg.timestamp().notNull().defaultNow(),
  updatedAt: pg
    .timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => sql`now()`),
};

export const users = pg.pgTable("users", {
  id: uuidv7pk,
  email: pg.varchar().notNull().unique(),
  passwordHash: pg.varchar().notNull(),
  ...timestamps,
});

export const sessions = pg.pgTable("sessions", {
  id: pg.varchar().primaryKey(),
  secretHash: pg.bytea().notNull(),
  userId: pg
    .uuid()
    .notNull()
    .references(() => users.id),
  createdAt: timestamps.createdAt,
});

export const profiles = pg.pgTable("profiles", {
  id: uuidv7pk,
  userId: pg
    .uuid()
    .unique()
    .notNull()
    .references(() => users.id),
  name: pg.varchar().notNull().default("Unknown User"),
  ...timestamps,
});

export const schema = {
  users,
  sessions,
  profiles,
};
