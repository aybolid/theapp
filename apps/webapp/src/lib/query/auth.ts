import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type { signin, signout, signup } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";

export const meQueryOptions = queryOptions<
  Treaty.Data<typeof server.api.auth.me.get>,
  Treaty.Error<typeof server.api.auth.me.get>
>({
  queryKey: ["me"],
  queryFn: async () => {
    const resp = await server.api.auth.me.get();
    if (resp.error) {
      throw resp.error;
    } else {
      return resp.data;
    }
  },
});

export function useMeSuspenseQuery(
  options?: Omit<
    UseSuspenseQueryOptions<
      Treaty.Data<typeof server.api.auth.me.get>,
      Treaty.Error<typeof server.api.auth.me.get>
    >,
    "queryFn" | "queryKey"
  >,
) {
  return useSuspenseQuery({
    ...meQueryOptions,
    ...options,
  });
}

export function useSignupMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.auth.signup.post>,
      Treaty.Error<typeof server.api.auth.signup.post>,
      z.infer<typeof signup.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data) => {
      const resp = await server.api.auth.signup.post(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useSigninMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.auth.signin.post>,
      Treaty.Error<typeof server.api.auth.signin.post>,
      z.infer<typeof signin.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signin"],
    mutationFn: async (data) => {
      const resp = await server.api.auth.signin.post(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useSignoutMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.auth.signout.delete>,
      Treaty.Error<typeof server.api.auth.signout.delete>,
      z.infer<typeof signout.query>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async (data) => {
      const resp = await server.api.auth.signout.delete({
        query: data,
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

export function useSignoutAllMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.auth.signout.all.delete>,
      Treaty.Error<typeof server.api.auth.signout.all.delete>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signout", "all"],
    mutationFn: async () => {
      const resp = await server.api.auth.signout.all.delete();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
