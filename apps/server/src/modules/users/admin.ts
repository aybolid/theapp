import { getUsersResponseSchema } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { UserService } from "../users/service";

export const usersAdmin = new Elysia({
  detail: {
    tags: ["users", "admin"],
  },
})
  .use(authGuard({ adminOnly: true }))
  .get(
    "",
    async (ctx) => {
      const users = await UserService.getUsers(db);
      return ctx.status(200, users);
    },
    {
      response: { 200: getUsersResponseSchema },
      detail: {
        description: "Get all users.",
      },
    },
  );
