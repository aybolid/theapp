import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { getUrlMetadata } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createQueries } from ".";

export const {
  queryOptions: urlMetadataQueryOptions,
  useQuery: useUrlMetadataQuery,
  useSuspenseQuery: useUrlMetadataSuspenseQuery,
} = createQueries(["metadata"], (query: z.infer<typeof getUrlMetadata.query>) =>
  server.api.misc["url-metadata"].get({ query }),
);

export function useGetUrlMetadataMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<(typeof server.api.misc)["url-metadata"]["get"]>,
      Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>,
      z.infer<typeof getUrlMetadata.query>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["create", "wish"],
    mutationFn: async (query) => {
      const resp = await server.api.misc["url-metadata"].get({
        query,
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
