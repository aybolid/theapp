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
