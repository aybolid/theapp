import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { GetUrlMetadataQuery, UrlMetadata } from "@theapp/schemas";
import { server } from "../api";

export const urlMetadataQueryOptions = (url: string) =>
  queryOptions<
    UrlMetadata,
    Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>
  >({
    queryKey: ["metadata", url],
    queryFn: async () => {
      const resp = await server.api.misc["url-metadata"].get({
        query: { url },
      });
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    staleTime: Infinity,
  });

export function useUrlMetadataSuspenseQuery(
  url: string,
  options?: Omit<
    UseSuspenseQueryOptions<
      UrlMetadata,
      Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...urlMetadataQueryOptions(url),
    ...options,
  });
}

export function useGetUrlMetadataMutation(
  options?: Omit<
    UseMutationOptions<
      UrlMetadata,
      Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>,
      GetUrlMetadataQuery
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["create", "wish"],
    mutationFn: async (data: GetUrlMetadataQuery) => {
      const resp = await server.api.misc["url-metadata"].get({
        query: { url: data.url },
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
