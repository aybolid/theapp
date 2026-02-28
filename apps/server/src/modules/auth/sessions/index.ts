import cron, { Patterns } from "@elysiajs/cron";
import { sessionsResponseSchema } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { lt } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard, INACTIVITY_TIMEOUT_SECONDS } from "../guard";

export const sessions = new Elysia({
  prefix: "/sessions",
  detail: {
    tags: ["sessions"],
  },
})
  .use(
    cron({
      name: "delete-inactive-sessions",
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      run: async () => {
        const cutoff = new Date(Date.now() - INACTIVITY_TIMEOUT_SECONDS * 1000);
        await db
          .delete(schema.sessions)
          .where(lt(schema.sessions.lastUsedAt, cutoff));
      },
    }),
  )
  .use(authGuard())
  .get(
    "/",
    async (ctx) => {
      const sessions = await db.query.sessions.findMany({
        where: { userId: { eq: ctx.userId } },
      });
      const markedSessions = sessions.map((s) => ({
        ...s,
        isCurrent: s.sessionId === ctx.sessionId,
      }));
      return ctx.status(200, markedSessions);
    },
    {
      response: {
        200: sessionsResponseSchema,
      },
      detail: {
        description: "Get all active sessions for the current user.",
      },
    },
  );
