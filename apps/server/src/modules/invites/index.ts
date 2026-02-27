import {
  getValidInviteBadRequestErrorSchema,
  getValidInviteNotFoundErrorSchema,
  getValidInviteParamsSchema,
  inviteResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import Elysia from "elysia";
import { invitesAdmin } from "./admin";
import { InviteService } from "./service";

export const invites = new Elysia({
  prefix: "/invites",
  detail: {
    tags: ["invites"],
  },
})
  .use(invitesAdmin)
  .get(
    "/valid/:inviteId",
    async (ctx) => {
      const invite = await InviteService.getInviteById(db, ctx.params.inviteId);
      if (!invite) {
        throw ctx.status(404, "Invite not found");
      }

      if (new Date(invite.expiresAt).getTime() < Date.now()) {
        await InviteService.deleteInvite(db, invite.inviteId);
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
      detail: { description: "Check if an invite is valid and return it." },
    },
  );
