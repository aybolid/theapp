import z from "zod";
import { userWithProfileAndAccessSchema } from "../db/user";

export const signup = {
  body: z.object({
    email: z.email("Must be a valid email"),
    password: z
      .string()
      .regex(/[a-z]/, "Must contain at least one lowercase letter")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number")
      .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character")
      .min(8, "Must be at least 8 characters")
      .max(255, "Must be at most 255 characters"),
  }),
  response: {
    201: z.literal("User created"),
    409: z.literal("Email already in use"),
  },
};

export const signin = {
  body: z.object({
    email: z.email("Must be a valid email"),
    password: z
      .string()
      .min(1, "Required")
      .max(255, "Must be at most 255 characters"),
  }),
  response: {
    200: z.literal("Signed in"),
    400: z.literal("Invalid email or password"),
  },
};

export const me = {
  response: {
    200: userWithProfileAndAccessSchema,
    404: z.literal("User not found"),
  },
};

export const signout = {
  query: z.object({
    sessionId: z.string().optional(),
  }),
  response: {
    200: z.literal("Signed out"),
  },
};

export const signoutAll = {
  response: {
    200: z.literal("Signed out all sessions"),
  },
};
