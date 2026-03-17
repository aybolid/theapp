import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions as _queryOptions,
  useMutation as _useMutation,
  useQuery as _useQuery,
  useSuspenseQuery as _useSuspenseQuery,
  QueryClient,
  type QueryKey,
  type UseMutationOptions,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

const QUERY_STALE_TIME_SECONS = 3 * 60;

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: { retry: false, staleTime: QUERY_STALE_TIME_SECONS * 1000 },
  },
});

export function createMutation<
  K extends QueryKey,
  F extends (
    // biome-ignore lint/suspicious/noExplicitAny: unknown or never wont work here
    ...args: any[]
  ) => Promise<Treaty.TreatyResponse<Record<number, unknown>>>,
>(mutationKey: K, mutationFn: F) {
  type Data = Treaty.Data<F>;
  type Error = Treaty.Error<F>;
  type Variables = Parameters<F>;

  const useMutation = (
    opts?: Omit<
      UseMutationOptions<Data, Error, Variables[0], Data>,
      "mutationKey" | "mutationFn"
    >,
  ) =>
    _useMutation<Data, Error, Variables[0], Data>({
      mutationKey,
      mutationFn: async (args) => {
        const resp = await mutationFn(args);
        if (resp.error) {
          throw resp.error;
        } else {
          return resp.data as Data;
        }
      },
      ...opts,
    });

  return useMutation;
}

export function createQueries<
  K extends QueryKey,
  F extends (
    // biome-ignore lint/suspicious/noExplicitAny: unknown or never wont work here
    ...args: any[]
  ) => Promise<Treaty.TreatyResponse<Record<number, unknown>>>,
>(
  queryKey: K,
  queryFn: F,
  defaultOpts?: Omit<
    UseQueryOptions<
      Treaty.Data<typeof queryFn>,
      Treaty.Error<typeof queryFn>,
      Treaty.Data<typeof queryFn>
    >,
    "queryKey" | "queryFn"
  >,
) {
  type Data = Treaty.Data<typeof queryFn>;
  type Error = Treaty.Error<typeof queryFn>;

  const queryOptions = (...args: Parameters<F>) =>
    _queryOptions<Data, Error, Data>({
      ...defaultOpts,
      queryKey: [...queryKey, ...args],
      queryFn: async () => {
        const resp = await queryFn(...args);
        if (resp.error) {
          throw resp.error;
        } else {
          return resp.data;
        }
      },
    });

  const useQuery = (...args: Parameters<F>) => _useQuery(queryOptions(...args));

  useQuery.withOptions = (
    opts: Omit<UseQueryOptions<Data, Error, Data>, "queryKey" | "queryFn">,
  ) => {
    return (...args: Parameters<F>) =>
      _useQuery({ ...queryOptions(...args), ...opts });
  };

  const useSuspenseQuery = (...args: Parameters<F>) =>
    _useSuspenseQuery(queryOptions(...args));

  useSuspenseQuery.withOptions = (
    opts: Omit<
      UseSuspenseQueryOptions<Data, Error, Data>,
      "queryKey" | "queryFn"
    >,
  ) => {
    return (...args: Parameters<F>) =>
      _useSuspenseQuery({ ...queryOptions(...args), ...opts });
  };

  return {
    queryOptions,
    useQuery,
    useSuspenseQuery,
  };
}
