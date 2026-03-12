import type { patchProfile, uploadPicture } from "@theapp/schemas";
import type z from "zod";
import { server } from "../api";
import { createMutation } from ".";

export const useUpdateProfileMutation = createMutation(
  ["update", "profile"],
  (data: z.infer<typeof patchProfile.body>) => server.api.profiles.patch(data),
);

export const useUploadProfilePictureMutation = createMutation(
  ["profile", "picture"],
  (data: z.infer<typeof uploadPicture.body>) =>
    server.api.profiles.picture.post(data),
);
