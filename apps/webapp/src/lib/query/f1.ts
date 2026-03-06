import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  F1Driver,
  F1Session,
  GetF1SessionsResponse,
  GetSessionByKeyParams,
  GetSessionDriversParams,
  GetSessionResultsParams,
  SessionResult,
} from "@theapp/schemas";
import { server } from "../api";

export const f1SessionsQueryOptions = queryOptions<
  GetF1SessionsResponse,
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
      GetF1SessionsResponse,
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

export function f1SessionByKeyQueryOptions(params: GetSessionByKeyParams) {
  return queryOptions<
    F1Session,
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
  params: GetSessionByKeyParams,
  options?: Omit<
    UseSuspenseQueryOptions<
      F1Session,
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

export function f1SessionDriversQueryOptions(params: GetSessionDriversParams) {
  return queryOptions<
    F1Driver[],
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
  params: GetSessionDriversParams,
  options?: Omit<
    UseSuspenseQueryOptions<
      F1Driver[],
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

export function f1SessionResultsQueryOptions(params: GetSessionResultsParams) {
  return queryOptions<
    SessionResult[],
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
  params: GetSessionResultsParams,
  options?: Omit<
    UseSuspenseQueryOptions<
      SessionResult[],
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
