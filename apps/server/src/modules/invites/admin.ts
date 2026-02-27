import { render } from "@react-email/components";
import {
  createInviteBodySchema,
  createInviteConflictErrorSchema,
  getInvitesResponseSchema,
  inviteResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { transporter } from "@theapp/server/emails";
import InviteEmail from "@theapp/server/emails/invite";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { AuthService } from "../auth/service";
import { InviteService } from "./service";

export const invitesAdmin = new Elysia({
  detail: {
    tags: ["invites", "admin"],
  },
})
  .use(authGuard({ adminOnly: true }))
  .get(
    "",
    async (ctx) => {
      const invites = await InviteService.getInvites(db);
      return ctx.status(200, invites);
    },
    {
      response: { 200: getInvitesResponseSchema },
      detail: { description: "Get all invites" },
    },
  )
  .post(
    "",
    async (ctx) => {
      let isEmailAvailable = await InviteService.checkEmailAvailability(
        db,
        ctx.body.email,
      );
      if (!isEmailAvailable) {
        return ctx.status(409, "Invite with this email already exists");
      }

      isEmailAvailable = await AuthService.checkEmailAvailability(
        db,
        ctx.body.email,
      );
      if (!isEmailAvailable) {
        return ctx.status(409, "User with this email already exists");
      }

      const invite = await db.transaction(async (tx) => {
        const invite = await InviteService.createInvite(tx, ctx.body.email);
        if (!invite) {
          throw new Error("Failed to create invite");
        }

        const link = `${process.env.INVITE_REDIRECT_URL}?invite=${invite.inviteId}`;

        try {
          const html = await render(InviteEmail({ link }));
          await transporter.sendMail({
            to: invite.email,
            subject: "Join THEAPP",
            html,
          });
        } catch {
          tx.rollback();
        }

        return invite;
      });

      return ctx.status(200, invite);
    },
    {
      body: createInviteBodySchema,
      response: {
        200: inviteResponseSchema,
        409: createInviteConflictErrorSchema,
      },
      detail: {
        description:
          "Create an invite. User will receive an email with a link to join the app.",
      },
    },
  );
