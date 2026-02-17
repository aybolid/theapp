import { defineRelations } from "drizzle-orm";
import { schema } from "./schema";

export const relations = defineRelations(schema, (r) => ({
  sessions: {
    user: r.one.users({
      from: r.sessions.userId,
      to: r.users.userId,
      optional: false,
    }),
  },
}));
