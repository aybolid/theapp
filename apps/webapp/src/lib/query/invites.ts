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
  RevokeInviteOkResponse,
  RevokeInviteParams,
} from "@theapp/schemas";
import { server } from "../api";

export function validInviteQueryOptions(inviteId: string) {
  return queryOptions<
    InviteResponse,
    Treaty.Error<ReturnType<typeof server.api.invites.valid>["get"]>
  >({
    queryKey: ["valid", "invite", inviteId],
    queryFn: async () => {
      const resp = await server.api.invites.valid({ inviteId }).get();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
  });
}

export function useValidInviteSuspenseQuery(
  inviteId: string,
  options?: Omit<
    UseSuspenseQueryOptions<
      InviteResponse,
      Treaty.Error<ReturnType<typeof server.api.invites.valid>["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...validInviteQueryOptions(inviteId),
    ...options,
  });
}

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

export function useRevokeInviteMutation(
  options?: Omit<
    UseMutationOptions<
      RevokeInviteOkResponse,
      Treaty.Error<ReturnType<typeof server.api.invites>["delete"]>,
      RevokeInviteParams
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["revoke", "invite"],
    mutationFn: async (data: RevokeInviteParams) => {
      const resp = await server.api
        .invites({ inviteId: data.inviteId })
        .delete();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
