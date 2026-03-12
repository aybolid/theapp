import { z } from "zod";
import { timestamps } from "../common";

export const accessSchema = z.object({
  accessId: z.uuidv7(),
  userId: z.uuidv7(),

  admin: z.boolean(),
  wishes: z.boolean(),
  f1: z.boolean(),

  ...timestamps,
});

export type Access = z.infer<typeof accessSchema>;
export type AccessMap = Omit<
  Access,
  "accessId" | "userId" | "createdAt" | "updatedAt"
>;
export type AccessKey = keyof AccessMap;
