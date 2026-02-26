import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  CreateWishBody,
  DeleteWishByIdParams,
  DeleteWishOkResponse,
  GetWishesReponse,
  PatchWishBody,
  PatchWishByIdParams,
  ReserveWishByIdParams,
  ReserveWishByIdQuery,
  WishResponse,
} from "@theapp/schemas";
import { server } from "../api";

export const wishesQueryOptions = queryOptions<
  GetWishesReponse,
  Treaty.Error<typeof server.api.wishes.get>
>({
  queryKey: ["wishes"],
  queryFn: async () => {
    const resp = await server.api.wishes.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useWishesSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      GetWishesReponse,
      Treaty.Error<typeof server.api.wishes.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...wishesQueryOptions,
    ...options,
  });
}

export function useCreateWishMutation(
  options?: Omit<
    UseMutationOptions<
      WishResponse,
      Treaty.Error<typeof server.api.wishes.post>,
      CreateWishBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["create", "wish"],
    mutationFn: async (data: CreateWishBody) => {
      const resp = await server.api.wishes.post(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useDeleteWishMutation(
  options?: Omit<
    UseMutationOptions<
      DeleteWishOkResponse,
      Treaty.Error<ReturnType<typeof server.api.wishes>["delete"]>,
      DeleteWishByIdParams
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["delete", "wish"],
    mutationFn: async (data: DeleteWishByIdParams) => {
      const resp = await server.api.wishes({ wishId: data.wishId }).delete();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useUpdateWishReservationMutation(
  options?: Omit<
    UseMutationOptions<
      WishResponse,
      Treaty.Error<ReturnType<typeof server.api.wishes.reserve>["post"]>,
      ReserveWishByIdParams & ReserveWishByIdQuery
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "wish", "reservation"],
    mutationFn: async (data: ReserveWishByIdParams & ReserveWishByIdQuery) => {
      const resp = await server.api.wishes
        .reserve({ wishId: data.wishId })
        .post(undefined, { query: { action: data.action } });
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useUpdateWishMutation(
  options?: Omit<
    UseMutationOptions<
      WishResponse,
      Treaty.Error<ReturnType<typeof server.api.wishes>["patch"]>,
      PatchWishBody & PatchWishByIdParams
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "wish"],
    mutationFn: async (data: PatchWishBody & PatchWishByIdParams) => {
      const resp = await server.api.wishes({ wishId: data.wishId }).patch({
        name: data.name,
        note: data.note,
        isCompleted: data.isCompleted,
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
