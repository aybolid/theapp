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
  users: {
    profile: r.one.profiles({
      from: r.users.userId,
      to: r.profiles.userId,
      optional: false,
    }),
    ownedWishes: r.many.wishes({
      alias: "owner",
    }),
    reservedWishes: r.many.wishes({
      alias: "reserver",
    }),
  },
  wishes: {
    owner: r.one.users({
      from: r.wishes.ownerId,
      to: r.users.userId,
      optional: false,
      alias: "owner",
    }),
    reserver: r.one.users({
      from: r.wishes.reserverId,
      to: r.users.userId,
      optional: true,
      alias: "reserver",
    }),
  },
}));
