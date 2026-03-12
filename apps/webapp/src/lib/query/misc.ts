import type { getUrlMetadata } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createMutation, createQueries } from ".";

export const {
  queryOptions: urlMetadataQueryOptions,
  useQuery: useUrlMetadataQuery,
  useSuspenseQuery: useUrlMetadataSuspenseQuery,
} = createQueries(
  ["metadata"],
  (query: z.infer<typeof getUrlMetadata.query>) =>
    server.api.misc["url-metadata"].get({ query }),
  { staleTime: Infinity },
);

export const useGetUrlMetadataMutation = createMutation(
  ["get", "metadata"],
  (query: z.infer<typeof getUrlMetadata.query>) =>
    server.api.misc["url-metadata"].get({ query }),
);
