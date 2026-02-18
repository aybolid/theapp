import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type {
  SigninBody,
  SigninOk,
  SignupBody,
  SignupCreated,
} from "@theapp/server/schemas";
import { server } from "../api";

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
