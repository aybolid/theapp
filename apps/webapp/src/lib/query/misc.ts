import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useQuery,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { getUrlMetadata } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";

export const urlMetadataQueryOptions = (
  query: z.infer<typeof getUrlMetadata.query>,
) =>
  queryOptions<
    Treaty.Data<(typeof server.api.misc)["url-metadata"]["get"]>,
    Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>
  >({
    queryKey: ["metadata", query],
    queryFn: async () => {
      const resp = await server.api.misc["url-metadata"].get({
        query,
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
  query: z.infer<typeof getUrlMetadata.query>,
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<(typeof server.api.misc)["url-metadata"]["get"]>,
      Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...urlMetadataQueryOptions(query),
    ...options,
  });
}

export function useUrlMetadataQuery(
  query: z.infer<typeof getUrlMetadata.query>,
  options?: Omit<
    UseQueryOptions<
      Treaty.Data<(typeof server.api.misc)["url-metadata"]["get"]>,
      Treaty.Error<(typeof server.api.misc)["url-metadata"]["get"]>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useQuery({
    ...urlMetadataQueryOptions(query),
    ...options,
  });
}

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
