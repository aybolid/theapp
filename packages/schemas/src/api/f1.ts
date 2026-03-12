import z from "zod";
import {
  f1DriverChampionshipStandingSchema,
  f1DriverSchema,
  f1SessionResultSchema,
  f1SessionSchema,
} from "../external/f1";

export const getF1DriverChampionshipStandings = {
  response: {
    200: z.array(f1DriverChampionshipStandingSchema),
  },
};

export const getF1Session = {
  params: z.object({
    sessionKey: z.coerce.number(),
  }),
  response: {
    200: f1SessionSchema,
    404: z.literal("Session not found"),
  },
};

export const getF1SessionDrivers = {
  params: z.object({
    sessionKey: z.coerce.number().or(z.literal("latest")),
  }),
  response: {
    200: z.array(f1DriverSchema),
  },
};

export const getF1SessionResults = {
  params: z.object({
    sessionKey: z.coerce.number(),
  }),
  response: {
    200: z.array(f1SessionResultSchema),
  },
};

export const getF1Sessions = {
  response: {
    200: z.array(f1SessionSchema),
  },
};
