import z from "zod";

export const urlMetadataSchema = z.object({
  title: z.string(),
  description: z.string(),
  banner: z.string(),
});

export type UrlMetadata = z.infer<typeof urlMetadataSchema>;

export const getUrlMetadata = {
  query: z.object({
    url: z.url(),
  }),
  response: {
    200: urlMetadataSchema,
  },
};
