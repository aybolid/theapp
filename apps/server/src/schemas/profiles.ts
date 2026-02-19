import z from "zod";
import { zDate } from "../utils/zod";

export const profilesPatchParamsSchema = z.object({
  profileId: z.uuidv7(),
});

export type ProfilesPatchParams = z.infer<typeof profilesPatchParamsSchema>;

export const profilesPatchBodySchema = z.object({
  name: z
    .string()
    .min(1, "Name is required")
    .max(255, "Must be less than 255 characters")
    .optional(),
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
  createdAt: zDate,
  updatedAt: zDate,
});

export type ProfileResponse = z.infer<typeof profileResponseSchema>;
