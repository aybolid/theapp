import type { FileType } from "elysia/type-system/types";
import z from "zod";
import { zDate } from ".";

export const profilesPatchBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Must be less than 255 characters")
    .optional(),
  bio: z.string().max(500, "Must be less than 500 characters").optional(),
});

export type ProfilesPatchBody = z.infer<typeof profilesPatchBodySchema>;

export const profilesPatchNotFoundErrorSchema = z.literal("Profile not found");

export type ProfilesPatchNotFoundError = z.infer<
  typeof profilesPatchNotFoundErrorSchema
>;

export const profileResponseSchema = z.object({
  profileId: z.uuidv7(),
  userId: z.uuidv7(),
  name: z.string(),
  bio: z.string(),
  picture: z.url().or(z.literal("")),
  createdAt: zDate,
  updatedAt: zDate,
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;

export const profilePictureBodySchema = z.object({
  file: z.file(),
});

export const PROFILE_PICTURE_FILE_TYPES: FileType[] = [
  "image/jpeg",
  "image/png",
  "image/svg",
  "image/webp",
];

/** 5 MB */
export const MAX_PROFILE_PICTURE_SIZE = 1024 * 1024 * 5;

export type ProfilePictureBody = z.infer<typeof profilePictureBodySchema>;

export const profilePictureTooLargeErrorSchema = z.literal("File too large");

export type ProfilePictureTooLargeError = z.infer<
  typeof profilePictureTooLargeErrorSchema
>;

export const profilePictureOkSchema = z.literal("Profile picture updated");

export type ProfilePictureOk = z.infer<typeof profilePictureOkSchema>;
