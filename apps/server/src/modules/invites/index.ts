import cron, { Patterns } from "@elysiajs/cron";
import {
  getValidInviteBadRequestErrorSchema,
  getValidInviteNotFoundErrorSchema,
  getValidInviteParamsSchema,
  inviteResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { eq, lt } from "drizzle-orm";
import Elysia from "elysia";
import { invitesAdmin } from "./admin";

export const invites = new Elysia({
  prefix: "/invites",
  detail: {
    tags: ["invites"],
  },
})
  .use(
    cron({
      name: "delete-expired-invites",
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      run: async () => {
        await db
          .delete(schema.invites)
          .where(lt(schema.invites.expiresAt, new Date()));
      },
    }),
  )
  .use(invitesAdmin)
  .get(
    "/valid/:inviteId",
    async (ctx) => {
      const invite = await db.query.invites.findFirst({
        where: { inviteId: { eq: ctx.params.inviteId } },
      });
      if (!invite) throw ctx.status(404, "Invite not found");

      if (new Date(invite.expiresAt).getTime() < Date.now()) {
        await db
          .delete(schema.invites)
          .where(eq(schema.invites.inviteId, ctx.params.inviteId));
        throw ctx.status(400, "Invite has expired");
      }

      return ctx.status(200, invite);
    },
    {
      params: getValidInviteParamsSchema,
      response: {
        200: inviteResponseSchema,
        404: getValidInviteNotFoundErrorSchema,
        400: getValidInviteBadRequestErrorSchema,
      },
      detail: {
        description: "Check if an invite is valid and not expired.",
      },
    },
  );
