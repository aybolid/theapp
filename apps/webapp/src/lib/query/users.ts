import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { getUser, patchUser, patchUserAccess } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createQueries } from ".";

export const {
  queryOptions: usersQueryOptions,
  useQuery: useUsersQuery,
  useSuspenseQuery: useUsersSuspenseQuery,
} = createQueries(["users"], () => server.api.users.get());

export const {
  queryOptions: userQueryOptions,
  useQuery: useUserQuery,
  useSuspenseQuery: useUserSuspenseQuery,
} = createQueries(["users"], (params: z.infer<typeof getUser.params>) =>
  server.api.users(params).get(),
);

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
