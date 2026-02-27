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

export const createInviteConflictErrorSchema = z.literal(
  "Invite or user with this email already exists",
);

export type CreateInviteConflictError = z.infer<
  typeof createInviteConflictErrorSchema
>;

export const getInvitesResponseSchema = z.array(inviteResponseSchema);

export type GetInvitesResponse = z.infer<typeof getInvitesResponseSchema>;

export const getValidInviteParamsSchema = z.object({
  inviteId: z.uuidv7(),
});

export type GetValidInviteParams = z.infer<typeof getValidInviteParamsSchema>;

export const getValidInviteNotFoundErrorSchema = z.literal("Invite not found");

export type GetValidInviteNotFoundError = z.infer<
  typeof getValidInviteNotFoundErrorSchema
>;

export const getValidInviteBadRequestErrorSchema =
  z.literal("Invite has expired");

export type GetValidInviteBadRequestError = z.infer<
  typeof getValidInviteBadRequestErrorSchema
>;
