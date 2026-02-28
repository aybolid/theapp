import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { GetUsersResponse, UserResponse } from "@theapp/schemas";
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
      Treaty.Error<typeof server.api.users.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...usersQueryOptions,
    ...options,
  });
}

export const userByIdQueryOptions = (userId: string) =>
  queryOptions<
    UserResponse,
    Treaty.Error<ReturnType<typeof server.api.users>["get"]>
  >({
    queryKey: ["users", userId] as const,
    queryFn: async () => {
      const resp = await server.api.users({ userId }).get();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
  });

export function useUserByIdSuspenseQuery(
  userId: string,
  options?: Omit<
    UseSuspenseQueryOptions<
      UserResponse,
      Treaty.Error<ReturnType<typeof server.api.users>["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...userByIdQueryOptions(userId),
    ...options,
  });
}
