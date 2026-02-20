import cron, { Patterns } from "@elysiajs/cron";
import { db } from "@theapp/server/db";
import { sessionsResponseSchema } from "@theapp/server/schemas";
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
    // @ts-expect-error - FIXME: remove type assertion
    cron({
      name: "delete-inactive-sessions",
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      run: async () => {
        await SessionService.deleteInactiveSessions(db);
      },
    }) as Elysia,
  )
  .use(authGuard)
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
