import {
  createWishBodySchema,
  createWishUnauthorizedErrorSchema,
  deleteWishByIdParamsSchema,
  deleteWishForbiddenErrorSchema,
  deleteWishNotFoundErrorSchema,
  deleteWishOkResponseSchema,
  getWishesResponseSchema,
  wishResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { UserService } from "../users/service";
import { WishService } from "./service";

export const wishes = new Elysia({
  prefix: "/wishes",
  detail: {
    tags: ["wishes"],
  },
})
  .use(authGuard)
  .get(
    "",
    async (ctx) => {
      const wishes = await WishService.getWishes(db);
      return ctx.status(200, wishes);
    },
    {
      response: { 200: getWishesResponseSchema },
      detail: {
        description: "Get all wishes with owner and reserver populated.",
      },
    },
  )
  .post(
    "",
    async (ctx) => {
      const currentUser = await UserService.getUserById(db, ctx.userId);
      if (!currentUser) {
        throw ctx.status(401, "Unauthorized");
      }

      const createdWish = await WishService.createWish(db, {
        ownerId: currentUser.userId,
        name: ctx.body.name,
        link: ctx.body.link,
        note: ctx.body.note,
      });
      if (!createdWish) {
        throw new Error("Failed to create wish");
      }

      return ctx.status(201, {
        ...createdWish,
        owner: currentUser,
        reserver: null,
      });
    },
    {
      body: createWishBodySchema,
      response: {
        201: wishResponseSchema,
        401: createWishUnauthorizedErrorSchema,
      },
      detail: {
        description: "Create new wish with current user as owner.",
      },
    },
  )
  .delete(
    "/:wishId",
    async (ctx) => {
      const wish = await WishService.getWishById(db, ctx.params.wishId);
      if (!wish) throw ctx.status(404, "Wish not found");
      if (wish.ownerId !== ctx.userId) {
        throw ctx.status(403, "Only owned wish can be deleted");
      }

      await WishService.deleteWishById(db, ctx.params.wishId);

      return ctx.status(200, "Wish deleted");
    },
    {
      params: deleteWishByIdParamsSchema,
      response: {
        404: deleteWishNotFoundErrorSchema,
        403: deleteWishForbiddenErrorSchema,
        200: deleteWishOkResponseSchema,
      },
      detail: {
        description: "Delete wish by id. Must be owned by current user.",
      },
    },
  );
