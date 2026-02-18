import { defineRelations } from "drizzle-orm";
import { schema } from "./schema";

export const relations = defineRelations(schema, (r) => ({
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  profiles: {
    user: r.one.users({
      from: r.profiles.userId,
      to: r.users.id,
      optional: false,
    }),
  },
  users: {
    profile: r.one.profiles({
      from: r.users.id,
      to: r.profiles.userId,
      optional: false,
    }),
  },
}));
