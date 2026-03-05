import { z } from "zod";
import { logger } from "./utils/logger";

const envSchema = z
  .object({
    DATABASE_URL: z.url(),
    CACHE_URL: z.url(),
    JWT_SECRET: z
      .string()
      .min(32, "JWT_SECRET should be at least 32 characters for security"),
    S3_ENDPOINT: z.url(),
    S3_ACCESS_KEY_ID: z.string().min(1, "S3_ACCESS_KEY_ID is required"),
    S3_SECRET_ACCESS_KEY: z.string().min(1, "S3_SECRET_ACCESS_KEY is required"),
    S3_REGION: z.string().min(1, "S3_REGION is required"),
    S3_BUCKET: z.string().min(1, "S3_BUCKET is required"),
    S3_PUBLIC_BASE_URL: z.url(),
    ADMIN_EMAIL: z.email(),
    ADMIN_PASSWORD: z.string().min(1, "ADMIN_PASSWORD is required"),
  })
  .readonly();

export function checkEnv() {
  envSchema.parse(process.env);
  logger.info("Environment loaded");
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends z.infer<typeof envSchema> {}
  }
}
