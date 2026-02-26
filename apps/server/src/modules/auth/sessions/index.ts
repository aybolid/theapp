import cron, { Patterns } from "@elysiajs/cron";
import { sessionsResponseSchema } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import Elysia from "elysia";
import { authGuard } from "../guard";
import { SessionService } from "./service";

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
        await SessionService.deleteInactiveSessions(db);
      },
    }),
  )
  .use(authGuard())
  .get(
    "",
    async (ctx) => {
      const sessions = await SessionService.getUserSessions(db, ctx.userId);
      return ctx.status(
        200,
        sessions.map((s) => ({
          ...s,
          isCurrent: s.sessionId === ctx.sessionId,
        })),
      );
    },
    {
      response: {
        200: sessionsResponseSchema,
      },
      detail: {
        description: "Returns current user's session.",
      },
    },
  );
