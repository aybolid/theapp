import { DeleteObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import {
  PROFILE_PICTURE_FILE_TYPES,
  profilePictureBodySchema,
  profilePictureOkSchema,
  profileResponseSchema,
  profilesPatchBodySchema,
  profilesPatchNotFoundErrorSchema,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { s3 } from "@theapp/server/s3";
import { generateSecureRandomString } from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia, { fileType } from "elysia";
import z from "zod";
import { logger } from "../../utils/logger";
import { authGuard } from "../auth/guard";

export const profiles = new Elysia({
  prefix: "/profiles",
  detail: {
    tags: ["profiles"],
  },
})
  .use(authGuard())
  .patch(
    "/",
    async (ctx) => {
      const profile = await db
        .update(schema.profiles)
        .set({
          name: ctx.body.name?.trim(),
          bio: ctx.body.bio?.trim(),
        })
        .where(eq(schema.profiles.userId, ctx.userId))
        .returning()
        .then((rows) => rows[0]);
      if (!profile) throw ctx.status(404, "Profile not found");
      return ctx.status(200, profile);
    },
    {
      body: profilesPatchBodySchema,
      response: {
        404: profilesPatchNotFoundErrorSchema,
        200: profileResponseSchema,
      },
      detail: {
        description: "Update the current user's profile (name and bio).",
      },
    },
  )
  .post(
    "/picture",
    async (ctx) => {
      // TODO: optimize image
      const buffer = await ctx.body.file.arrayBuffer();
      const u8Buffer = new Uint8Array(buffer);

      const profile = await db
        .select({ picture: schema.profiles.picture })
        .from(schema.profiles)
        .where(eq(schema.profiles.userId, ctx.userId))
        .then((rows) => rows[0]);

      const key = `avatars/${ctx.userId}/${generateSecureRandomString()}.${ctx.body.file.type.split("/")[1]}`;

      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: u8Buffer,
          ContentType: ctx.body.file.type,
          CacheControl: "public, max-age=31536000, immutable",
        }),
      );

      await db
        .update(schema.profiles)
        .set({
          picture: key,
        })
        .where(eq(schema.profiles.userId, ctx.userId));

      if (profile?.picture) {
        try {
          await s3.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET,
              Key: profile.picture,
            }),
          );
        } catch (error) {
          logger.error(
            { error, key: profile.picture },
            "Failed to delete old avatar from S3",
          );
        }
      }

      return ctx.status(200, "Profile picture updated");
    },
    {
      body: z.object({
        file: profilePictureBodySchema.shape.file.refine(
          (file) =>
            fileType(file, PROFILE_PICTURE_FILE_TYPES).catch(() => false),
          {
            error: "Unsupported file type",
          },
        ),
      }),
      response: {
        200: profilePictureOkSchema,
      },
      detail: {
        description: "Upload and set the user's profile picture.",
      },
    },
  );
