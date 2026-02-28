import { render } from "@react-email/components";
import {
  createInviteBodySchema,
  createInviteConflictErrorSchema,
  getInvitesResponseSchema,
  inviteResponseSchema,
  revokeInviteNotFoundErrorSchema,
  revokeInviteOkResponseSchema,
  revokeInviteParamsSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { transporter } from "@theapp/server/emails";
import InviteEmail from "@theapp/server/emails/invite";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const invitesAdmin = new Elysia({
  detail: {
    tags: ["invites", "admin"],
  },
})
  .use(authGuard({ adminOnly: true }))
  .get(
    "/",
    async (ctx) => {
      const invites = await db.query.invites.findMany();
      return ctx.status(200, invites);
    },
    {
      response: { 200: getInvitesResponseSchema },
      detail: { description: "Get all invites" },
    },
  )
  .post(
    "/",
    async (ctx) => {
      const isEmailAvailable = await db.transaction(async (tx) => {
        const userWithEmail = await tx.query.users.findFirst({
          where: { email: { eq: ctx.body.email.toLowerCase() } },
        });
        if (userWithEmail) return false;

        const inviteWithEmail = await tx.query.invites.findFirst({
          where: { email: { eq: ctx.body.email.toLowerCase() } },
        });
        if (inviteWithEmail) return false;

        return true;
      });

      if (!isEmailAvailable) {
        throw ctx.status(409, "Invite or user with this email already exists");
      }

      const invite = await db.transaction(async (tx) => {
        const invite = await tx
          .insert(schema.invites)
          .values({ email: ctx.body.email })
          .returning()
          .then((rows) => rows[0]);
        if (!invite) {
          throw new Error("Failed to create invite");
        }

        const link = `${process.env.INVITE_REDIRECT_URL}?inviteId=${invite.inviteId}`;

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
          "Create a new invite. Admin only. Sends invite email to the provided address.",
      },
    },
  )
  .delete(
    "/:inviteId",
    async (ctx) => {
      const deleted = await db
        .delete(schema.invites)
        .where(eq(schema.invites.inviteId, ctx.params.inviteId))
        .returning()
        .then((rows) => rows[0]);

      if (!deleted) {
        throw ctx.status(404, "Invite not found");
      }

      return ctx.status(200, "Invite revoked");
    },
    {
      params: revokeInviteParamsSchema,
      response: {
        200: revokeInviteOkResponseSchema,
        404: revokeInviteNotFoundErrorSchema,
      },
      detail: { description: "Revoke an invite by ID. Admin only." },
    },
  );
