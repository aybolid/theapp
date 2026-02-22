import z from "zod";
import { userAgentSchema } from "./ua";
import { zDate } from "./zdate";

export const sessionsResponseSchema = z.array(
  z.object({
    sessionId: z.string(),
    userId: z.uuidv7(),
    uaData: userAgentSchema,
    createdAt: zDate,
    lastUsedAt: zDate,
    isCurrent: z.boolean(),
  }),
);

export type SessionsResponse = z.infer<typeof sessionsResponseSchema>;
