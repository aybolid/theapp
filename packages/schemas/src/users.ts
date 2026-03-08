import z from "zod";
import { userStatusSchema, userWithAccessSchema } from "./auth";

export const getUsersResponseSchema = z.array(userWithAccessSchema);

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
  status: userStatusSchema.optional(),
});

export type UpdateUserBody = z.infer<typeof updateUserBodySchema>;

export const updateUserNotFoundErrorSchema = z.literal("User not found");

export type UpdateUserNotFoundError = z.infer<
  typeof updateUserNotFoundErrorSchema
>;

export const updateUserAccessParamsSchema = z.object({
  userId: z.uuidv7(),
});

export type UpdateUserAccessParams = z.infer<
  typeof updateUserAccessParamsSchema
>;

export const updateUserAccessBodySchema = z.object({
  admin: z.boolean().optional(),
  wishes: z.boolean().optional(),
  f1: z.boolean().optional(),
});

export type UpdateUserAccessBody = z.infer<typeof updateUserAccessBodySchema>;

export const updateUserAccessNotFoundErrorSchema = z.literal("User not found");

export type UpdateUserAccessNotFoundError = z.infer<
  typeof updateUserAccessNotFoundErrorSchema
>;

export const updateUserAccessBadRequestSchema = z.literal(
  "Cannot update admin access for self",
);

export type UpdateUserAccessBadRequest = z.infer<
  typeof updateUserAccessBadRequestSchema
>;
