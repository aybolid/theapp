import { getUsersResponseSchema } from "@theapp/schemas";
import { db } from "@theapp/server/db";
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
  );
