import z from "zod";
import { zDate } from "../utils/zod";

export const signupBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(255),
});

export type SignupBody = z.infer<typeof signupBodySchema>;

export const singupConflictErrorSchema = z.literal("Email already in use");

export type SignupConflictError = z.infer<typeof singupConflictErrorSchema>;

export const signupCreatedSchema = z.literal("User created");

export type SignupCreated = z.infer<typeof signupCreatedSchema>;

export const signinBodySchema = z.object({
  email: z.email(),
  password: z.string().min(8).max(255),
});

export type SigninBody = z.infer<typeof signinBodySchema>;

export const signinBadRequestSchema = z.literal("Invalid email or password");

export type SigninBadRequest = z.infer<typeof signinBadRequestSchema>;

export const signinOkSchema = z.literal("User signed in");

export type SigninOk = z.infer<typeof signinOkSchema>;

export const userResponseSchema = z.object({
  userId: z.uuid(),
  email: z.email(),
  createdAt: zDate,
  updatedAt: zDate,
});

export type UserResponse = z.infer<typeof userResponseSchema>;
