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
