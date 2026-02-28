import z from "zod";
import { userResponseSchema } from "./auth";

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
