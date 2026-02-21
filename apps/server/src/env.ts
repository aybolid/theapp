import { isProduction } from "elysia/error";
import { z } from "zod";

const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET should be at least 32 characters for security"),
    S3_ENDPOINT: z.url(),
    S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
    S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
    S3_REGION: z.string().min(1, "S3_REGION is required"),
    S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
    S3_PUBLIC_BASE_URL: z.url(),
  })
  .readonly();

export function checkEnv() {
  const parsed = envSchema.parse(process.env);
  if (!isProduction) {
    console.table(parsed);
  }
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
