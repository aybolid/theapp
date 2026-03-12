import z from "zod";
import { timestamps } from "../common";
import { userWithProfileSchema } from "./user";

export const wishSchema = z.object({
  wishId: z.uuidv7(),
  ownerId: z.uuidv7(),
  name: z.string(),
  note: z.string(),
  link: z.url(),
  reserverId: z.uuidv7().nullable(),
  isCompleted: z.boolean(),
  ...timestamps,
});

export type Wish = z.infer<typeof wishSchema>;

export const wishWithUsersSchema = wishSchema.extend({
  owner: userWithProfileSchema,
  reserver: userWithProfileSchema.nullable(),
});

export type WishWithUsers = z.infer<typeof wishWithUsersSchema>;
