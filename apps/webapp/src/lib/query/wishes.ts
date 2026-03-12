import type {
  deleteWish,
  patchWish,
  postWish,
  reserveWish,
} from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createMutation, createQueries } from ".";

export const {
  queryOptions: wishesQueryOptions,
  useQuery: useWishesQuery,
  useSuspenseQuery: useWishesSuspenseQuery,
} = createQueries(["wishes"], () => server.api.wishes.get());

export const useCreateWishMutation = createMutation(
  ["create", "wish"],
  (data: z.infer<typeof postWish.body>) => server.api.wishes.post(data),
);

export const useDeleteWishMutation = createMutation(
  ["delete", "wish"],
  (data: z.infer<typeof deleteWish.params>) =>
    server.api.wishes({ wishId: data.wishId }).delete(),
);

export const useUpdateWishReservationMutation = createMutation(
  ["update", "wish", "reservation"],
  (
    data: z.infer<typeof reserveWish.params> &
      z.infer<typeof reserveWish.query>,
  ) =>
    server.api.wishes
      .reserve({ wishId: data.wishId })
      .post(undefined, { query: { action: data.action } }),
);

export const useUpdateWishMutation = createMutation(
  ["update", "wish"],
  (data: z.infer<typeof patchWish.params> & z.infer<typeof patchWish.body>) =>
    server.api.wishes({ wishId: data.wishId }).patch({
      name: data.name,
      note: data.note,
      isCompleted: data.isCompleted,
    }),
);
