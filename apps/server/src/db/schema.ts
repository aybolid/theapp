import type { UserAgentData } from "@theapp/schemas";
import { sql } from "drizzle-orm";
import * as pg from "drizzle-orm/pg-core";

const uuidv7pk = () => pg.uuid().primaryKey().default(sql`uuidv7()`);

const timestamps = {
  createdAt: pg.timestamp().notNull().defaultNow(),
  updatedAt: pg
    .timestamp()
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
};

export const users = pg.pgTable("users", {
  userId: uuidv7pk(),
  email: pg.varchar().notNull().unique(),
  passwordHash: pg.varchar({ length: 255 }).notNull(),
  ...timestamps,
});

export const sessions = pg.pgTable("sessions", {
  sessionId: pg.varchar({ length: 255 }).primaryKey(),
  secretHash: pg.bytea().notNull(),
  userId: pg
    .uuid()
    .notNull()
    .references(() => users.userId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  uaData: pg
    .jsonb()
    .$type<UserAgentData>()
    .notNull()
    .default({ ua: "", browser: {}, cpu: {}, device: {}, engine: {}, os: {} }),
  createdAt: timestamps.createdAt,
  lastUsedAt: pg.timestamp().notNull().defaultNow(),
});

export const profiles = pg.pgTable("profiles", {
  profileId: uuidv7pk(),
  userId: pg
    .uuid()
    .unique()
    .notNull()
    .references(() => users.userId, {
      onDelete: "cascade",
      onUpdate: "cascade",
    }),
  name: pg.varchar().notNull().default("Unknown User"),
  bio: pg.text().notNull().default(""),
  picture: pg.varchar().notNull().default(""),
  ...timestamps,
});

export const schema = {
  users,
  sessions,
  profiles,
};
