import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { GetF1SessionsResponse } from "@theapp/schemas";
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
