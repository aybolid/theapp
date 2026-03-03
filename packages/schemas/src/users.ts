import z from "zod";
import { userResponseSchema, userRoleSchema, userStatusSchema } from "./auth";

export const getUsersResponseSchema = z.array(userResponseSchema);

export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;

export const getUserByIdParamsSchema = z.object({
  userId: z.uuidv7(),
});

export type GetUserByIdParams = z.infer<typeof getUserByIdParamsSchema>;

export const getUserByIdNotFoundErrorSchema = z.literal("User not found");

export type GetUserByIdNotFoundError = z.infer<
  typeof getUserByIdNotFoundErrorSchema
>;

export const updateUserParamsSchema = z.object({
  userId: z.uuidv7(),
});

export type UpdateUserParams = z.infer<typeof updateUserParamsSchema>;

export const updateUserBodySchema = z.object({
  role: userRoleSchema.optional(),
  status: userStatusSchema.optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserNotFoundErrorSchema = z.literal("User not found");

export type UpdateUserNotFoundError = z.infer<
  typeof updateUserNotFoundErrorSchema
>;
