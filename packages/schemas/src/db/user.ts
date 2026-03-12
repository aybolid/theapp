import z from "zod";
import { timestamps } from "../common";
import { accessSchema } from "./access";
import { profileSchema } from "./profile";

export const userStatusSchema = z.enum(["active", "inactive"]);

export const userSchema = z.object({
  userId: z.uuidv7(),
  status: userStatusSchema,
  email: z.email(),
  ...timestamps,
});

export type User = z.infer<typeof userSchema>;

export const userWithProfileSchema = userSchema.extend({
  profile: profileSchema,
});

export type UserWithProfile = z.infer<typeof userWithProfileSchema>;

export const userWithProfileAndAccessSchema = userWithProfileSchema.extend({
  access: accessSchema,
});

export type UserWithProfileAndAccess = z.infer<
  typeof userWithProfileAndAccessSchema
>;
