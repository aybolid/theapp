import z from "zod";
import { zDate } from "./zdate";

export const f1SessionSchema = z.object({
  circuit_key: z.number(),
  circuit_short_name: z.string(),
  country_code: z.string(),
  country_key: z.number(),
  country_name: z.string(),
  date_end: zDate,
  date_start: zDate,
  gmt_offset: z.string(),
  location: z.string(),
  meeting_key: z.number(),
  session_key: z.number(),
  session_name: z.string(),
  session_type: z.string(),
  year: z.number(),
});

export type F1Session = z.infer<typeof f1SessionSchema>;

export const getF1SessionsResponseSchema = z.array(f1SessionSchema);

export type GetF1SessionsResponse = z.infer<typeof getF1SessionsResponseSchema>;
