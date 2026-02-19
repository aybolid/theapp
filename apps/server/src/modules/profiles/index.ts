import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import {
  profileResponseSchema,
  profilesPatchBodySchema,
  profilesPatchNotFoundErrorSchema,
  profilesPatchParamsSchema,
} from "@theapp/server/schemas";
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const profiles = new Elysia({
  prefix: "/profiles",
  detail: {
    tags: ["profiles"],
  },
})
  .use(authGuard)
  .patch(
    "/:profileId",
    async (ctx) => {
      const [updatedProfile] = await db
        .update(schema.profiles)
        .set({ name: ctx.body.name?.trim() })
        .where(
          and(
            eq(schema.profiles.profileId, ctx.params.profileId),
            eq(schema.profiles.userId, ctx.user.userId),
          ),
        )
        .returning();
      if (!updatedProfile) {
        throw ctx.status(404, "Profile not found");
      }
      return ctx.status(200, updatedProfile);
    },
    {
      params: profilesPatchParamsSchema,
      body: profilesPatchBodySchema,
      response: {
        404: profilesPatchNotFoundErrorSchema,
        200: profileResponseSchema,
      },
      detail: {
        description:
          "Update user's profile by id. Only owned profile can be updated.",
      },
    },
  );
