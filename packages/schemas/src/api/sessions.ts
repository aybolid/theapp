import z from "zod";
import { sessionSchema } from "../db/session";

export const markedSessionsSchema = sessionSchema.extend({
  isCurrent: z.boolean(),
});

export type MarkedSession = z.infer<typeof markedSessionsSchema>;

export const getSessions = {
  response: {
    200: z.array(markedSessionsSchema),
  },
};
