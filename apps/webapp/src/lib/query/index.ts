import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions as _queryOptions,
  useQuery as _useQuery,
  useSuspenseQuery as _useSuspenseQuery,
  type QueryKey,
  type UseQueryOptions,
  type UseSuspenseQueryOptions,
} from "@tanstack/react-query";

export function createQueries<
  K extends QueryKey,
  F extends (
    // biome-ignore lint/suspicious/noExplicitAny: unknown or never wont work here
    ...args: any[]
  ) => Promise<Treaty.TreatyResponse<Record<number, unknown>>>,
>(queryKey: K, fetchFn: F) {
  type Data = Treaty.Data<typeof fetchFn>;
  type Error = Treaty.Error<typeof fetchFn>;

  const queryOptions = (...args: Parameters<F>) =>
    _queryOptions<Data, Error, Data>({
      queryKey: [...queryKey, ...args],
      queryFn: async () => {
        const resp = await fetchFn(...args);
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
      _useQuery({ ...opts, ...queryOptions(...args) });
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
      _useSuspenseQuery({ ...opts, ...queryOptions(...args) });
  };

  return {
    queryOptions,
    useQuery,
    useSuspenseQuery,
  };
}
