import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  getF1Session,
  getF1SessionDrivers,
  getF1SessionResults,
} from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";

export const f1SessionsQueryOptions = queryOptions<
  Treaty.Data<typeof server.api.f1.sessions.get>,
  Treaty.Error<typeof server.api.f1.sessions.get>
>({
  queryKey: ["f1", "sessions"],
  queryFn: async () => {
    const resp = await server.api.f1.sessions.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useF1SessionsSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<typeof server.api.f1.sessions.get>,
      Treaty.Error<typeof server.api.f1.sessions.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...f1SessionsQueryOptions,
    ...options,
  });
}

export function f1SessionByKeyQueryOptions(
  params: z.infer<typeof getF1Session.params>,
) {
  return queryOptions<
    Treaty.Data<ReturnType<typeof server.api.f1.sessions>["get"]>,
    Treaty.Error<ReturnType<typeof server.api.f1.sessions>["get"]>
  >({
    queryKey: ["f1", "session", params],
    queryFn: async () => {
      const resp = await server.api.f1.sessions(params).get();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
  });
}

export function useF1SessionByKeySuspenseQuery(
  params: z.infer<typeof getF1Session.params>,
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<ReturnType<typeof server.api.f1.sessions>["get"]>,
      Treaty.Error<ReturnType<typeof server.api.f1.sessions>["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...f1SessionByKeyQueryOptions(params),
    ...options,
  });
}

export function f1SessionDriversQueryOptions(
  params: z.infer<typeof getF1SessionDrivers.params>,
) {
  return queryOptions<
    Treaty.Data<ReturnType<typeof server.api.f1.sessions>["drivers"]["get"]>,
    Treaty.Error<ReturnType<typeof server.api.f1.sessions>["drivers"]["get"]>
  >({
    queryKey: ["f1", "session", "drivers", params],
    queryFn: async () => {
      const resp = await server.api.f1.sessions(params).drivers.get();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
  });
}

export function useF1SessionDriversSuspenseQuery(
  params: z.infer<typeof getF1SessionDrivers.params>,
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<ReturnType<typeof server.api.f1.sessions>["drivers"]["get"]>,
      Treaty.Error<ReturnType<typeof server.api.f1.sessions>["drivers"]["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...f1SessionDriversQueryOptions(params),
    ...options,
  });
}

export function f1SessionResultsQueryOptions(
  params: z.infer<typeof getF1SessionResults.params>,
) {
  return queryOptions<
    Treaty.Data<ReturnType<typeof server.api.f1.sessions>["results"]["get"]>,
    Treaty.Error<ReturnType<typeof server.api.f1.sessions>["results"]["get"]>
  >({
    queryKey: ["f1", "session", "results", params],
    queryFn: async () => {
      const resp = await server.api.f1.sessions(params).results.get();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
  });
}

export function useF1SessionResultsSuspenseQuery(
  params: z.infer<typeof getF1SessionResults.params>,
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<ReturnType<typeof server.api.f1.sessions>["results"]["get"]>,
      Treaty.Error<ReturnType<typeof server.api.f1.sessions>["results"]["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...f1SessionResultsQueryOptions(params),
    ...options,
  });
}

export const f1DriverChampionshipStandingsQueryOptions = queryOptions<
  Treaty.Data<typeof server.api.f1.championship.drivers.get>,
  Treaty.Error<typeof server.api.f1.championship.drivers.get>
>({
  queryKey: ["f1", "championship", "drivers"],
  queryFn: async () => {
    const resp = await server.api.f1.championship.drivers.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useF1DriverChampionshipStandingsSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<typeof server.api.f1.championship.drivers.get>,
      Treaty.Error<typeof server.api.f1.championship.drivers.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...f1DriverChampionshipStandingsQueryOptions,
    ...options,
  });
}
