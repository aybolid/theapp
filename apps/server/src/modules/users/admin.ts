import {
  getUsersResponseSchema,
  updateUserBodySchema,
  updateUserNotFoundErrorSchema,
  updateUserParamsSchema,
  userResponseSchema,
} from "@theapp/schemas";
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
  .use(authGuard({ adminOnly: true }))
  .get(
    "/",
    async (ctx) => {
      const users = await db.query.users.findMany({
        columns: { passwordHash: false },
        with: { profile: true },
      });
      return ctx.status(200, users);
    },
    {
      response: { 200: getUsersResponseSchema },
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
        with: { profile: true },
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
      return ctx.status(200, { ...safeUser, profile: user.profile });
    },
    {
      params: updateUserParamsSchema,
      body: updateUserBodySchema,
      response: { 200: userResponseSchema, 404: updateUserNotFoundErrorSchema },
      detail: {
        description: "Update a user. Admin only.",
      },
    },
  );
