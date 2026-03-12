import {
  deleteWish,
  getWishes,
  patchWish,
  postWish,
  reserveWish,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { and, eq, isNull, not } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const wishes = new Elysia({
  prefix: "/wishes",
  detail: {
    tags: ["wishes"],
  },
})
  .use(authGuard({ access: ["wishes"] }))
  .get(
    "/",
    async (ctx) => {
      const wishes = await db.query.wishes.findMany({
        with: {
          owner: { with: { profile: true }, columns: { passwordHash: false } },
          reserver: {
            with: { profile: true },
            columns: { passwordHash: false },
          },
        },
      });
      return ctx.status(200, wishes);
    },
    {
      ...getWishes,
      detail: {
        description: "Get all wishes with owner and reserver populated.",
      },
    },
  )
  .post(
    "/",
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.userId } },
        columns: { passwordHash: false },
        with: { profile: true },
      });
      if (!user) throw ctx.status(401, "Unauthorized");

      const wish = await db
        .insert(schema.wishes)
        .values({
          ownerId: ctx.userId,
          name: ctx.body.name.trim(),
          link: ctx.body.link.trim(),
          note: ctx.body.note?.trim(),
        })
        .returning()
        .then((rows) => rows[0]);
      if (!wish) throw new Error("Failed to create wish");

      return ctx.status(201, {
        ...wish,
        owner: user,
        reserver: null,
      });
    },
    {
      ...postWish,
      detail: {
        description: "Create new wish with current user as owner.",
      },
    },
  )
  .delete(
    "/:wishId",
    async (ctx) => {
      const wish = await db.query.wishes.findFirst({
        where: { wishId: { eq: ctx.params.wishId } },
      });
      if (!wish) throw ctx.status(404, "Wish not found");
      if (wish.ownerId !== ctx.userId) {
        throw ctx.status(403, "Only owned wish can be deleted");
      }

      await db
        .delete(schema.wishes)
        .where(
          and(
            eq(schema.wishes.wishId, ctx.params.wishId),
            eq(schema.wishes.ownerId, ctx.userId),
          ),
        );

      return ctx.status(200, "Wish deleted");
    },
    {
      ...deleteWish,
      detail: {
        description:
          "Delete a wish by ID. Only the owner can delete their wish.",
      },
    },
  )
  .patch(
    "/:wishId",
    async (ctx) => {
      const wish = await db.query.wishes.findFirst({
        where: { wishId: { eq: ctx.params.wishId } },
        with: {
          owner: { columns: { passwordHash: false }, with: { profile: true } },
          reserver: {
            columns: { passwordHash: false },
            with: { profile: true },
          },
        },
      });
      if (!wish) throw ctx.status(404, "Wish not found");
      if (wish.ownerId !== ctx.userId) {
        throw ctx.status(403, "Only owned wish can be updated");
      }

      const updatedWish = await db
        .update(schema.wishes)
        .set({
          name: ctx.body.name?.trim(),
          note: ctx.body.note?.trim(),
          isCompleted: ctx.body.isCompleted,
        })
        .where(
          and(
            eq(schema.wishes.wishId, ctx.params.wishId),
            eq(schema.wishes.ownerId, ctx.userId),
          ),
        )
        .returning()
        .then((rows) => rows[0]);
      if (!updatedWish) throw new Error("Failed to update wish");

      return ctx.status(200, {
        ...updatedWish,
        owner: wish.owner,
        reserver: wish.reserver,
      });
    },
    {
      ...patchWish,
      detail: {
        description: "Update wish by id. Must be owned by current user",
      },
    },
  )
  .post(
    "/reserve/:wishId",
    async (ctx) => {
      const wish = await db.query.wishes.findFirst({
        where: { wishId: { eq: ctx.params.wishId } },
        with: {
          owner: { columns: { passwordHash: false }, with: { profile: true } },
          reserver: {
            columns: { passwordHash: false },
            with: { profile: true },
          },
        },
      });
      if (!wish) throw ctx.status(404, "Wish not found");
      const currentUser = await db.query.users.findFirst({
        where: { userId: { eq: ctx.userId } },
        columns: { passwordHash: false },
        with: { profile: true },
      });
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

      const updatedWish = await db
        .update(schema.wishes)
        .set({
          reserverId: ctx.query.action === "start" ? ctx.userId : null,
        })
        .where(
          ctx.query.action === "start"
            ? and(
                eq(schema.wishes.wishId, ctx.params.wishId),
                not(eq(schema.wishes.ownerId, ctx.userId)),
                isNull(schema.wishes.reserverId),
              )
            : and(
                eq(schema.wishes.wishId, ctx.params.wishId),
                eq(schema.wishes.reserverId, ctx.userId),
              ),
        )
        .returning()
        .then((rows) => rows[0]);

      if (!updatedWish) {
        throw new Error("Failed to update reserver");
      }

      return ctx.status(200, {
        ...updatedWish,
        owner: wish.owner,
        reserver: ctx.query.action === "start" ? currentUser : null,
      });
    },
    {
      ...reserveWish,
      detail: {
        description:
          "Reserve or unreserve a wish. Use `action=start` to reserve or `action=stop` to unreserve.",
      },
    },
  );
