import z from "zod";
import { timestamps } from "../common";

export const profileSchema = z.object({
  profileId: z.uuidv7(),
  userId: z.uuidv7(),
  name: z.string(),
  bio: z.string(),
  picture: z.string(),
  ...timestamps,
});

export type Profile = z.infer<typeof profileSchema>;
