import type { getUser, patchUser, patchUserAccess } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createMutation, createQueries } from ".";

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

export const useUpdateUserMutation = createMutation(
  ["update", "user"],
  (data: z.infer<typeof patchUser.body> & z.infer<typeof patchUser.params>) =>
    server.api.users({ userId: data.userId }).patch({
      status: data.status,
    }),
);

export const useUpdateUserAccessMutation = createMutation(
  ["update", "user", "access"],
  (
    data: z.infer<typeof patchUserAccess.body> &
      z.infer<typeof patchUserAccess.params>,
  ) =>
    server.api.users({ userId: data.userId }).access.patch({
      admin: data.admin,
      wishes: data.wishes,
      f1: data.f1,
    }),
);
