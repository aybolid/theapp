import z from "zod";
import { wishWithUsersSchema } from "../db/wish";

export const getWishes = {
  response: {
    200: z.array(wishWithUsersSchema),
  },
};

export const MAX_WISH_NOTE_LEN_AFTER_TRIM = 120;

export const postWish = {
  body: z.object({
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
  }),
  response: {
    201: wishWithUsersSchema,
    401: z.literal("Unauthorized"),
  },
};

export const deleteWish = {
  params: z.object({
    wishId: z.uuidv7(),
  }),
  response: {
    200: z.literal("Wish deleted"),
    403: z.literal("Only owned wish can be deleted"),
    404: z.literal("Wish not found"),
  },
};

export const patchWish = {
  params: z.object({
    wishId: z.uuidv7(),
  }),
  body: z.object({
    name: z
      .string()
      .trim()
      .min(1, "Wish name is required")
      .max(100, "Must be less than 100 characters")
      .optional(),
    note: z
      .string()
      .trim()
      .max(
        MAX_WISH_NOTE_LEN_AFTER_TRIM,
        `Must be less than ${MAX_WISH_NOTE_LEN_AFTER_TRIM} characters`,
      )
      .optional(),
    isCompleted: z.boolean().optional(),
  }),
  response: {
    200: wishWithUsersSchema,
    403: z.literal("Only owned wish can be updated"),
    404: z.literal("Wish not found"),
  },
};

export const reserveWish = {
  params: z.object({
    wishId: z.uuidv7(),
  }),
  query: z.object({
    action: z.enum(["start", "stop"]),
  }),
  response: {
    200: wishWithUsersSchema,
    400: z.literal("Not reserved"),
    401: z.literal("Unauthorized"),
    403: z.enum([
      "Already reserved",
      "Owned wish cannot be reserved",
      "Only current reserver can stop reservation",
    ]),
    404: z.literal("Wish not found"),
  },
};
