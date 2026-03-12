import cron, { Patterns } from "@elysiajs/cron";
import { getSessions } from "@theapp/schemas";
import Elysia from "elysia";
import { authGuard } from "../guard";
import { deleteInactiveSessions, getActiveUserSessions } from "./service";

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
      run: deleteInactiveSessions,
    }),
  )
  .use(authGuard())
  .get(
    "/",
    async (ctx) => {
      const sessions = await getActiveUserSessions({ userId: ctx.userId }).then(
        (sessions) =>
          sessions.map((s) => ({
            ...s,
            isCurrent: s.sessionId === ctx.sessionId,
          })),
      );
      return ctx.status(200, sessions);
    },
    {
      ...getSessions,
      detail: {
        description: "Get all active sessions for the current user.",
      },
    },
  );
