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

export const createWishBodySchema = z.object({
  name: z
    .string()
    .min(1, "Wish name is required")
    .max(255, "Must be less than 255 characters"),
  link: z.url(),
  note: z.string().max(300, "Must be less than 300 characters"),
});

export type CreateWishBody = z.infer<typeof createWishBodySchema>;

export const createWishUnauthorizedErrorSchema = z.literal("Unauthorized");

export type CreateWishUnauthorizedError = z.infer<
  typeof createWishUnauthorizedErrorSchema
>;

export const getWishesResponseSchema = z.array(wishResponseSchema);

export type GetWishesReponse = z.infer<typeof getWishesResponseSchema>;
