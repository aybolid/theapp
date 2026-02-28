import { PutObjectCommand } from "@aws-sdk/client-s3";
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
import sharp from "sharp";
import z from "zod";
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
      const buffer = await ctx.body.file.arrayBuffer();
      const optimizedBuffer = await sharp(buffer)
        .webp()
        .resize(400, 400, { fit: "cover" })
        .toBuffer();

      const key = `avatars/${ctx.userId}/${generateSecureRandomString()}.webp`;

      // TODO: remove old avatar
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: optimizedBuffer,
          ContentType: "image/webp",
        }),
      );

      const picture = `${process.env.S3_PUBLIC_BASE_URL}/${key}`;

      await db
        .update(schema.profiles)
        .set({
          picture,
        })
        .where(eq(schema.profiles.userId, ctx.userId));

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
        description:
          "Upload and set the user's profile picture. Image is optimized to 400x400 WebP.",
      },
    },
  );
