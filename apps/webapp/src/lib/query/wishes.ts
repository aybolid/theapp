import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseSuspenseQueryOptions,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { GetWishesReponse } from "@theapp/schemas";
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
