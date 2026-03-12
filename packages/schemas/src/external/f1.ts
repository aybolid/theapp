import z from "zod";
import { zDate } from "../zdate";

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

export const f1DriverSchema = z.object({
  broadcast_name: z.string().nullable(),
  driver_number: z.number(),
  first_name: z.string().nullable(),
  full_name: z.string().nullable(),
  headshot_url: z.url().nullable(),
  last_name: z.string().nullable(),
  meeting_key: z.number(),
  name_acronym: z.string().nullable(),
  session_key: z.number(),
  team_colour: z.string().nullable(),
  team_name: z.string().nullable(),
});

export type F1Driver = z.infer<typeof f1DriverSchema>;

export const f1SessionResultSchema = z.object({
  dnf: z.boolean(),
  dns: z.boolean(),
  dsq: z.boolean(),
  driver_number: z.number(),
  duration: z
    .number()
    .nullable()
    .or(
      z.tuple([
        z.number().nullable(),
        z.number().nullable(),
        z.number().nullable(),
      ]),
    ),
  gap_to_leader: z
    .number()
    .nullable()
    .or(
      z.tuple([
        z.number().nullable(),
        z.number().nullable(),
        z.number().nullable(),
      ]),
    )
    .or(z.string()),
  number_of_laps: z.number().nullable(),
  meeting_key: z.number(),
  position: z.number().nullable(),
  session_key: z.number(),
});
export type F1SessionResult = z.infer<typeof f1SessionResultSchema>;

export const f1DriverChampionshipStandingSchema = z.object({
  driver_number: z.number(),
  meeting_key: z.number(),
  points_current: z.number().nullable(),
  points_start: z.number().nullable(),
  position_current: z.number(),
  position_start: z.number().nullable(),
  session_key: z.number(),
});

export type F1DriverChampionshipStanding = z.infer<
  typeof f1DriverChampionshipStandingSchema
>;
