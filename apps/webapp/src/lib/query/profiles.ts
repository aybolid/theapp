import type { Treaty } from "@elysiajs/eden";
import { type UseMutationOptions, useMutation } from "@tanstack/react-query";
import type { patchProfile, uploadPicture } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";

export function useUpdateProfileMutation(
  options?: Omit<
    UseMutationOptions<
      Treaty.Data<typeof server.api.profiles.patch>,
      Treaty.Error<typeof server.api.profiles.patch>,
      z.infer<typeof patchProfile.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["update", "profile"],
    mutationFn: async (data) => {
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
      Treaty.Data<typeof server.api.profiles.picture.post>,
      Treaty.Error<typeof server.api.profiles.picture.post>,
      z.infer<typeof uploadPicture.body>
    >,
    "mutationKey" | "mutationFn"
  >,
) {
  return useMutation({
    mutationKey: ["profile", "picture"],
    mutationFn: async (data) => {
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
