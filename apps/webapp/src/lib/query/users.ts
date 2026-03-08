import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  GetUsersResponse,
  UpdateUserAccessBody,
  UpdateUserAccessParams,
  UpdateUserBody,
  UpdateUserParams,
  UserResponse,
  UserWithAccessResponse,
} from "@theapp/schemas";
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

export function useUpdateUserMutation(
  options?: Omit<
    UseMutationOptions<
      UserWithAccessResponse,
      Treaty.Error<ReturnType<typeof server.api.users>["patch"]>,
      UpdateUserParams & UpdateUserBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "user"],
    mutationFn: async (data: UpdateUserParams & UpdateUserBody) => {
      const resp = await server.api.users({ userId: data.userId }).patch({
        status: data.status,
      });
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useUpdateUserAccessMutation(
  options?: Omit<
    UseMutationOptions<
      UserWithAccessResponse,
      Treaty.Error<ReturnType<typeof server.api.users>["access"]["patch"]>,
      UpdateUserAccessParams & UpdateUserAccessBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "user", "access"],
    mutationFn: async (data: UpdateUserAccessParams & UpdateUserAccessBody) => {
      const resp = await server.api
        .users({ userId: data.userId })
        .access.patch({
          admin: data.admin,
          wishes: data.wishes,
          f1: data.f1,
        });
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
