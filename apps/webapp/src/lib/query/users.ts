import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { GetUsersResponse } from "@theapp/schemas";
import { server } from "../api";

export const usersQueryOptions = queryOptions<
  GetUsersResponse,
  Treaty.Error<typeof server.api.users.get>
>({
  queryKey: ["users"],
  queryFn: async () => {
    const resp = await server.api.users.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useUsersSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      GetUsersResponse,
      Treaty.Error<typeof server.api.wishes.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...usersQueryOptions,
    ...options,
  });
}
