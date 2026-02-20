import { db } from "@theapp/server/db";
import {
  profileResponseSchema,
  profilesPatchBodySchema,
  profilesPatchNotFoundErrorSchema,
  profilesPatchParamsSchema,
} from "@theapp/server/schemas";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { ProfileService } from "./service";

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
      const updatedProfile = await ProfileService.updateProfile(
        db,
        { profileId: ctx.params.profileId, userId: ctx.userId },
        { name: ctx.body.name },
      );
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
