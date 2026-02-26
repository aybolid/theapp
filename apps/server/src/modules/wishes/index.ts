import { render } from "@react-email/components";
import {
  createWishBodySchema,
  createWishUnauthorizedErrorSchema,
  deleteWishByIdParamsSchema,
  deleteWishForbiddenErrorSchema,
  deleteWishNotFoundErrorSchema,
  deleteWishOkResponseSchema,
  getWishesResponseSchema,
  patchWishBodySchema,
  patchWishByIdParamsSchema,
  patchWishForbiddenErrorSchema,
  patchWishNotFoundErrorSchema,
  reserveWishByIdBadRequestErrorSchema,
  reserveWishByIdForbiddenErrorSchema,
  reserveWishByIdNotFoundErrorSchema,
  reserveWishByIdParamsSchema,
  reserveWishByIdQuerySchema,
  reserveWishByIdUnauthorizedErrorSchema,
  wishResponseSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { transporter } from "@theapp/server/emails";
import WishNotReservedEmail from "@theapp/server/emails/wish-not-reserved";
import WishReservedEmail from "@theapp/server/emails/wish-reserved";
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

      await WishService.deleteWishById(db, {
        wishId: ctx.params.wishId,
        currentUserId: ctx.userId,
      });

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
  )
  .patch(
    ":wishId",
    async (ctx) => {
      const wish = await WishService.getWishById(db, ctx.params.wishId);
      if (!wish) throw ctx.status(404, "Wish not found");
      if (wish.ownerId !== ctx.userId) {
        throw ctx.status(403, "Only owned wish can be updated");
      }

      const updatedWish = await WishService.updateWishById(db, {
        wishId: ctx.params.wishId,
        currentUserId: ctx.userId,
        ...ctx.body,
      });
      if (!updatedWish) {
        throw new Error("Failed to update wish");
      }

      return ctx.status(200, {
        ...updatedWish,
        owner: wish.owner,
        reserver: wish.reserver,
      });
    },
    {
      params: patchWishByIdParamsSchema,
      body: patchWishBodySchema,
      response: {
        404: patchWishNotFoundErrorSchema,
        403: patchWishForbiddenErrorSchema,
        200: wishResponseSchema,
      },
      detail: {
        description: "Update wish by id. Must be owned by current user",
      },
    },
  )
  .post(
    "reserve/:wishId",
    async (ctx) => {
      const wish = await WishService.getWishById(db, ctx.params.wishId);
      if (!wish) throw ctx.status(404, "Wish not found");
      const currentUser = await UserService.getUserById(db, ctx.userId);
      if (!currentUser) throw ctx.status(401, "Unauthorized");

      if (ctx.query.action === "start") {
        if (wish.reserverId) {
          throw ctx.status(403, "Already reserved");
        }
        if (wish.ownerId === currentUser.userId) {
          throw ctx.status(403, "Owned wish cannot be reserved");
        }
      }

      if (ctx.query.action === "stop") {
        if (!wish.reserverId) {
          throw ctx.status(400, "Not reserved");
        }
        if (wish.reserverId !== currentUser.userId) {
          throw ctx.status(403, "Only current reserver can stop reservation");
        }
      }

      const updatedWish = await WishService.updateWishReserver(db, {
        wishId: ctx.params.wishId,
        reserverId: ctx.query.action === "start" ? ctx.userId : null,
        currentUserId: ctx.userId,
      });
      if (!updatedWish) {
        throw new Error("Failed to update reserver");
      }

      render(
        ctx.query.action === "start"
          ? WishReservedEmail({
              ownerName: wish.owner.profile.name,
              reserverName: currentUser.profile.name,
              wishName: wish.name,
            })
          : WishNotReservedEmail({
              ownerName: wish.owner.profile.name,
              wishName: wish.name,
              prevReserverName: currentUser.profile.name,
            }),
      ).then((html) =>
        transporter.sendMail({
          to: wish.owner.email,
          subject:
            ctx.query.action === "start"
              ? "Your wish has been reserved"
              : "Your wish no longer reserved",
          html,
        }),
      );

      return ctx.status(200, {
        ...updatedWish,
        owner: wish.owner,
        reserver: ctx.query.action === "start" ? currentUser : null,
      });
    },
    {
      params: reserveWishByIdParamsSchema,
      query: reserveWishByIdQuerySchema,
      response: {
        200: wishResponseSchema,
        404: reserveWishByIdNotFoundErrorSchema,
        401: reserveWishByIdUnauthorizedErrorSchema,
        403: reserveWishByIdForbiddenErrorSchema,
        400: reserveWishByIdBadRequestErrorSchema,
      },
      detail: {
        description:
          "Start or stop wish reservation by id.\n- Owner is unable to reserve the wish.\n- Already reserved wish cannot be reserved.\n- Only current reserver can stop reservation.",
      },
    },
  );
