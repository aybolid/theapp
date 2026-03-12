import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { patchUser, patchUserAccess } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";

export const usersQueryOptions = queryOptions<
  Treaty.Data<typeof server.api.users.get>,
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
      Treaty.Data<typeof server.api.users.get>,
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
    Treaty.Data<ReturnType<typeof server.api.users>["get"]>,
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
      Treaty.Data<ReturnType<typeof server.api.users>["get"]>,
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
      Treaty.Data<ReturnType<typeof server.api.users>["patch"]>,
      Treaty.Error<ReturnType<typeof server.api.users>["patch"]>,
      z.infer<typeof patchUser.body> & z.infer<typeof patchUser.params>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "user"],
    mutationFn: async (data) => {
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
      Treaty.Data<ReturnType<typeof server.api.users>["access"]["patch"]>,
      Treaty.Error<ReturnType<typeof server.api.users>["access"]["patch"]>,
      z.infer<typeof patchUserAccess.body> &
        z.infer<typeof patchUserAccess.params>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "user", "access"],
    mutationFn: async (data) => {
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
