import type {
  getF1Session,
  getF1SessionDrivers,
  getF1SessionResults,
} from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createQueries } from ".";

export const {
  queryOptions: f1SessionsQueryOptions,
  useQuery: useF1SessionsQuery,
  useSuspenseQuery: useF1SessionsSuspenseQuery,
} = createQueries(["f1", "sessions"], () => server.api.f1.sessions.get(), {
  staleTime: Infinity,
});

export const {
  queryOptions: f1SessionByKeyQueryOptions,
  useQuery: useF1SessionByKeyQuery,
  useSuspenseQuery: useF1SessionByKeySuspenseQuery,
} = createQueries(
  ["f1", "session"],
  (params: z.infer<typeof getF1Session.params>) =>
    server.api.f1.sessions(params).get(),
  { staleTime: Infinity },
);

export const {
  queryOptions: f1SessionDriversQueryOptions,
  useQuery: useF1SessionDriversQuery,
  useSuspenseQuery: useF1SessionDriversSuspenseQuery,
} = createQueries(
  ["f1", "session", "drivers"],
  (params: z.infer<typeof getF1SessionDrivers.params>) =>
    server.api.f1.sessions(params).drivers.get(),
  { staleTime: Infinity },
);

export const {
  queryOptions: f1SessionResultsQueryOptions,
  useQuery: useF1SessionResultsQuery,
  useSuspenseQuery: useF1SessionResultsSuspenseQuery,
} = createQueries(
  ["f1", "session", "results"],
  (params: z.infer<typeof getF1SessionResults.params>) =>
    server.api.f1.sessions(params).results.get(),
  { staleTime: Infinity },
);

export const {
  queryOptions: f1DriverChampionshipStandingsQueryOptions,
  useQuery: useF1DriverChampionshipStandingsQuery,
  useSuspenseQuery: useF1DriverChampionshipStandingsSuspenseQuery,
} = createQueries(
  ["f1", "championship", "drivers"],
  () => server.api.f1.championship.drivers.get(),
  { staleTime: Infinity },
);
