import z from "zod";
import { zDate } from "./zdate";

export const inviteResponseSchema = z.object({
  inviteId: z.uuidv7(),
  email: z.email(),
  createdAt: zDate,
  expiresAt: zDate,
});

export type InviteResponse = z.infer<typeof inviteResponseSchema>;

export const createInviteBodySchema = z.object({
  email: z.email("Must be a valid email"),
});

export type CreateInviteBody = z.infer<typeof createInviteBodySchema>;

export const createInviteConflictErrorSchema = z.enum([
  "Invite with this email already exists",
  "User with this email already exists",
]);

export type CreateInviteConflictError = z.infer<
  typeof createInviteConflictErrorSchema
>;

export const getInvitesResponseSchema = z.array(inviteResponseSchema);

export type GetInvitesResponse = z.infer<typeof getInvitesResponseSchema>;
