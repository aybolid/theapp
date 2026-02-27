import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  CreateInviteBody,
  GetInvitesResponse,
  InviteResponse,
} from "@theapp/schemas";
import { server } from "../api";

export const invitesQueryOptions = queryOptions<
  GetInvitesResponse,
  Treaty.Error<typeof server.api.invites.get>
>({
  queryKey: ["invites"],
  queryFn: async () => {
    const resp = await server.api.invites.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useInvitesSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      GetInvitesResponse,
      Treaty.Error<typeof server.api.invites.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...invitesQueryOptions,
    ...options,
  });
}

export function useCreateInviteMutation(
  options?: Omit<
    UseMutationOptions<
      InviteResponse,
      Treaty.Error<typeof server.api.invites.post>,
      CreateInviteBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["create", "invite"],
    mutationFn: async (data: CreateInviteBody) => {
      const resp = await server.api.invites.post(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
