import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type {
  ProfilePictureBody,
  ProfilePictureOk,
  ProfileResponse,
  ProfilesPatchBody,
} from "@theapp/server/schemas";
import { server } from "../api";

export function useUpdateProfileMutation(
  options?: Omit<
    UseMutationOptions<
      ProfileResponse,
      Treaty.Error<typeof server.api.profiles.patch>,
      ProfilesPatchBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "profile"],
    mutationFn: async (data: ProfilesPatchBody) => {
      const resp = await server.api.profiles.patch(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}

export function useUploadProfilePictureMutation(
  options?: Omit<
    UseMutationOptions<
      ProfilePictureOk,
      Treaty.Error<typeof server.api.profiles.picture.post>,
      ProfilePictureBody
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["profile", "picture"],
    mutationFn: async (data: ProfilePictureBody) => {
      const resp = await server.api.profiles.picture.post(data);
      if (resp.error) {
        throw resp.error;
      } else {
        return resp.data;
      }
    },
    ...options,
  });
}
