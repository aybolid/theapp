import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { SessionsResponse } from "@theapp/schemas";
import { server } from "../api";

export const sessionsQueryOptions = queryOptions<
  SessionsResponse,
  Treaty.Error<typeof server.api.auth.sessions.get>
>({
  queryKey: ["sessions"],
  queryFn: async () => {
    const resp = await server.api.auth.sessions.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useSessionsSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      SessionsResponse,
      Treaty.Error<typeof server.api.auth.sessions.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...sessionsQueryOptions,
    ...options,
  });
}
