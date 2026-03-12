import type { FileType } from "elysia/type-system/types";
import z from "zod";
import { profileSchema } from "../db/profile";

export const MAX_PROFILE_BIO_LEN_AFTER_TRIM = 200;

export const patchProfile = {
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Cannot be empty")
      .max(100, "Too long")
      .optional(),
    bio: z
      .string()
      .trim()
      .min(1, "Cannot be empty")
      .max(MAX_PROFILE_BIO_LEN_AFTER_TRIM, "Too long")
      .optional(),
  }),
  response: {
    200: profileSchema,
    404: z.literal("Profile not found"),
  },
};

export const MAX_PROFILE_PICTURE_SIZE = 1024 * 1024 * 5;

export const PROFILE_PICTURE_FILE_TYPES: FileType[] = [
  "image/jpeg",
  "image/png",
];

export const uploadPicture = {
  body: z.object({
    file: z.file().max(MAX_PROFILE_PICTURE_SIZE, "File too large"),
  }),
  response: {
    200: z.literal("Profile picture updated"),
  },
};
