import z from "zod";
import { userResponseSchema } from "./auth";
import { zDate } from "./zdate";

export const wishResponseSchema = z.object({
  wishId: z.uuidv7(),
  ownerId: z.uuidv7(),
  owner: userResponseSchema,
  name: z.string(),
  note: z.string(),
  link: z.url(),
  isCompleted: z.boolean(),
  reserverId: z.uuidv7().nullable(),
  reserver: userResponseSchema.nullable(),
  createdAt: zDate,
  updatedAt: zDate,
});

export type WishResponse = z.infer<typeof wishResponseSchema>;

export const MAX_WISH_NOTE_LEN_AFTER_TRIM = 120;

export const createWishBodySchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Wish name is required")
    .max(100, "Must be less than 100 characters"),
  link: z.url(),
  note: z
    .string()
    .trim()
    .max(
      MAX_WISH_NOTE_LEN_AFTER_TRIM,
      `Must be less than ${MAX_WISH_NOTE_LEN_AFTER_TRIM} characters`,
    ),
});

export type CreateWishBody = z.infer<typeof createWishBodySchema>;

export const createWishUnauthorizedErrorSchema = z.literal("Unauthorized");

export type CreateWishUnauthorizedError = z.infer<
  typeof createWishUnauthorizedErrorSchema
>;

export const getWishesResponseSchema = z.array(wishResponseSchema);

export type GetWishesReponse = z.infer<typeof getWishesResponseSchema>;
