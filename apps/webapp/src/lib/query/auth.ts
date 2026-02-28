import type { Treaty } from "@elysiajs/eden";
import {
  queryOptions,
  type UseMutationOptions,
  type UseSuspenseQueryOptions,
  useMutation,
  useSuspenseQuery,
} from "@tanstack/react-query";
import type {
  SigninBody,
  SigninOk,
  SignoutOk,
  SignoutQuery,
  SignupBody,
  SignupCreated,
  UserResponse,
} from "@theapp/schemas";
import { server } from "../api";

export const meQueryOptions = queryOptions<
  UserResponse,
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
      UserResponse,
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
      SignupCreated,
      Treaty.Error<typeof server.api.auth.signup.post>,
      SignupBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signup"],
    mutationFn: async (data: SignupBody) => {
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
      SigninOk,
      Treaty.Error<typeof server.api.auth.signin.post>,
      SigninBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signin"],
    mutationFn: async (data: SigninBody) => {
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
      SignoutOk,
      Treaty.Error<typeof server.api.auth.signout.post>,
      SignoutQuery | undefined
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signout"],
    mutationFn: async (data: SignoutQuery) => {
      const resp = await server.api.auth.signout.post(undefined, {
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
      SignoutOk,
      Treaty.Error<typeof server.api.auth.signout.all.post>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["signout", "all"],
    mutationFn: async () => {
      const resp = await server.api.auth.signout.all.post();
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
