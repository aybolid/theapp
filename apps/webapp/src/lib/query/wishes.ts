import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type {
  deleteWish,
  patchWish,
  postWish,
  reserveWish,
} from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createQueries } from ".";

export const {
  queryOptions: wishesQueryOptions,
  useQuery: useWishesQuery,
  useSuspenseQuery: useWishesSuspenseQuery,
} = createQueries(["wishes"], () => server.api.wishes.get());

export function useCreateWishMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.wishes.post>,
      Treaty.Error<typeof server.api.wishes.post>,
      z.infer<typeof postWish.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["create", "wish"],
    mutationFn: async (data) => {
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
      Treaty.Data<ReturnType<typeof server.api.wishes>["delete"]>,
      Treaty.Error<ReturnType<typeof server.api.wishes>["delete"]>,
      z.infer<typeof deleteWish.params>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["delete", "wish"],
    mutationFn: async (data) => {
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
      Treaty.Data<ReturnType<typeof server.api.wishes.reserve>["post"]>,
      Treaty.Error<ReturnType<typeof server.api.wishes.reserve>["post"]>,
      z.infer<typeof reserveWish.params> & z.infer<typeof reserveWish.query>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "wish", "reservation"],
    mutationFn: async (data) => {
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
      Treaty.Data<ReturnType<typeof server.api.wishes>["patch"]>,
      Treaty.Error<ReturnType<typeof server.api.wishes>["patch"]>,
      z.infer<typeof patchWish.params> & z.infer<typeof patchWish.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "wish"],
    mutationFn: async (data) => {
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
