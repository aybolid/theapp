import { PutObjectCommand } from "@aws-sdk/client-s3";
import { db } from "@theapp/server/db";
import { s3 } from "@theapp/server/s3";
import {
  MAX_PROFILE_PICTURE_SIZE,
  PROFILE_PICTURE_FILE_TYPES,
  profilePictureBodySchema,
  profilePictureOkSchema,
  profilePictureTooLargeErrorSchema,
  profileResponseSchema,
  profilesPatchBodySchema,
  profilesPatchNotFoundErrorSchema,
} from "@theapp/server/schemas";
import { generateSecureRandomString } from "@theapp/server/utils/crypto";
import Elysia, { fileType } from "elysia";
import sharp from "sharp";
import z from "zod";
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
    "",
    async (ctx) => {
      const updatedProfile = await ProfileService.updateProfile(
        db,
        { userId: ctx.userId },
        { name: ctx.body.name },
      );
      if (!updatedProfile) {
        throw ctx.status(404, "Profile not found");
      }
      return ctx.status(200, updatedProfile);
    },
    {
      body: profilesPatchBodySchema,
      response: {
        404: profilesPatchNotFoundErrorSchema,
        200: profileResponseSchema,
      },
      detail: {
        description: "Update current user's profile.",
      },
    },
  )
  .post(
    "/picture",
    async (ctx) => {
      if (ctx.body.file.size > MAX_PROFILE_PICTURE_SIZE) {
        throw ctx.status(413, "File too large");
      }

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

      await ProfileService.updateProfile(
        db,
        { userId: ctx.userId },
        { picture },
      );

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
        413: profilePictureTooLargeErrorSchema,
        200: profilePictureOkSchema,
      },
      detail: {
        description: `Upload a profile picture. Supported file types: ${PROFILE_PICTURE_FILE_TYPES.map((ft) => `\`${ft}\``).join(", ")}. Max size: \`${MAX_PROFILE_PICTURE_SIZE}\` bytes.`,
      },
    },
  );
