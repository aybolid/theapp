import z from "zod";
import { zDate } from "../utils/zod";
import { userAgentSchema } from "./ua";

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
