import {
  getUserByIdNotFoundErrorSchema,
  getUserByIdParamsSchema,
  userResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { usersAdmin } from "./admin";

export const users = new Elysia({
  prefix: "/users",
  detail: {
    tags: ["users"],
  },
})
  .use(usersAdmin)
  .use(authGuard())
  .get(
    "/:userId",
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.params.userId } },
        columns: { passwordHash: false },
        with: { profile: true },
      });
      if (!user) throw ctx.status(404, "User not found");
      return ctx.status(200, user);
    },
    {
      params: getUserByIdParamsSchema,
      response: {
        200: userResponseSchema,
        404: getUserByIdNotFoundErrorSchema,
      },
      detail: {
        description: "Get user by ID.",
      },
    },
  );
