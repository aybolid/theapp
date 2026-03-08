import z from "zod";
import { zDate } from "./zdate";

export const accessResponseSchema = z.object({
  accessId: z.uuidv7(),
  userId: z.uuidv7(),
  admin: z.boolean(),
  wishes: z.boolean(),
  f1: z.boolean(),
  createdAt: zDate,
  updatedAt: zDate,
});

export type AccessResponse = z.infer<typeof accessResponseSchema>;
