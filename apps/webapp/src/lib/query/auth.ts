import type { signin, signout, signup } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createMutation, createQueries } from ".";

export const {
  queryOptions: meQueryOptions,
  useQuery: useMeQuery,
  useSuspenseQuery: useMeSuspenseQuery,
} = createQueries(["me"], () => server.api.auth.me.get());

export const useSignupMutation = createMutation(
  ["singup"],
  (body: z.infer<typeof signup.body>) => server.api.auth.signup.post(body),
);

export const useSigninMutation = createMutation(
  ["signin"],
  (body: z.infer<typeof signin.body>) => server.api.auth.signin.post(body),
);

export const useSignoutMutation = createMutation(
  ["signout"],
  (query: z.infer<typeof signout.query>) =>
    server.api.auth.signout.delete({ query }),
);

export const useSignoutAllMutation = createMutation(["signout", "all"], () =>
  server.api.auth.signout.all.delete(),
);
