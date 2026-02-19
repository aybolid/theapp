import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type {
  ProfileResponse,
  ProfilesPatchBody,
} from "@theapp/server/schemas";
import { server } from "../api";

export function useUpdateProfile(
  profileId: ProfileResponse["profileId"],
  options?: Omit<
    UseMutationOptions<
      ProfileResponse,
      Treaty.Error<ReturnType<typeof server.api.profiles>["patch"]>,
      ProfilesPatchBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "profile", profileId],
    mutationFn: async (data: ProfilesPatchBody) => {
      const resp = await server.api.profiles({ profileId }).patch(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
