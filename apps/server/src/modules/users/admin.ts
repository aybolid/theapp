import { getUsers, patchUser, patchUserAccess } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const usersAdmin = new Elysia({
  detail: {
    tags: ["users", "admin"],
  },
})
  .use(authGuard({ access: ["admin"] }))
  .get(
    "/",
    async (ctx) => {
      const users = await db.query.users.findMany({
        columns: { passwordHash: false },
        with: { profile: true, access: true },
      });
      return ctx.status(200, users);
    },
    {
      ...getUsers,
      detail: {
        description: "Get all users with their profiles. Admin only.",
      },
    },
  )
  .patch(
    "/:userId",
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.params.userId } },
        columns: { passwordHash: false },
        with: { profile: true, access: true },
      });
      if (!user) throw ctx.status(404, "User not found");

      const updatedUser = await db
        .update(schema.users)
        .set(ctx.body)
        .where(eq(schema.users.userId, ctx.params.userId))
        .returning()
        .then((rows) => rows[0]);
      if (!updatedUser) throw new Error("Failed to update user");

      const { passwordHash: _, ...safeUser } = updatedUser;
      return ctx.status(200, {
        ...safeUser,
        profile: user.profile,
        access: user.access,
      });
    },
    {
      ...patchUser,
      detail: {
        description: "Update a user. Admin only.",
      },
    },
  )
  .patch(
    "/:userId/access",
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.params.userId } },
        columns: { passwordHash: false },
        with: { profile: true, access: true },
      });
      if (!user) throw ctx.status(404, "User not found");

      const isUpdatingSelf = ctx.params.userId === ctx.userId;

      if (isUpdatingSelf) {
        if (ctx.body.admin !== user.access.admin) {
          throw ctx.status(400, "Cannot update admin access for self");
        }
      }

      const updatedAccess = await db
        .update(schema.accesses)
        .set(ctx.body)
        .where(eq(schema.accesses.accessId, user.access.accessId))
        .returning()
        .then((rows) => rows[0]);
      if (!updatedAccess) throw new Error("Failed to update access");

      return ctx.status(200, { ...user, access: updatedAccess });
    },
    {
      ...patchUserAccess,
      detail: {
        description: "Update a user's access config. Admin only.",
      },
    },
  );
