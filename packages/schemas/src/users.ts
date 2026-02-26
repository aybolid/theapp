import z from "zod";
import { userResponseSchema } from "./auth";

export const getUsersResponseSchema = z.array(userResponseSchema);

export type GetUsersResponse = z.infer<typeof getUsersResponseSchema>;
