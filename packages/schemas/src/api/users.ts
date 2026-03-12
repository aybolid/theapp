import z from "zod";
import {
  userStatusSchema,
  userWithProfileAndAccessSchema,
  userWithProfileSchema,
} from "../db/user";

export const getUser = {
  params: z.object({
    userId: z.uuidv7(),
  }),
  response: {
    200: userWithProfileSchema,
    404: z.literal("User not found"),
  },
};

export const getUsers = {
  response: {
    200: z.array(userWithProfileAndAccessSchema),
  },
};

export const patchUser = {
  params: z.object({
    userId: z.uuidv7(),
  }),
  body: z.object({
    status: userStatusSchema.optional(),
  }),
  response: {
    200: userWithProfileAndAccessSchema,
    404: z.literal("User not found"),
  },
};

export const patchUserAccess = {
  params: z.object({
    userId: z.uuidv7(),
  }),
  body: z.object({
    admin: z.boolean().optional(),
    wishes: z.boolean().optional(),
    f1: z.boolean().optional(),
  }),
  response: {
    200: userWithProfileAndAccessSchema,
    400: z.literal("Cannot update admin access for self"),
    404: z.literal("User not found"),
  },
};
