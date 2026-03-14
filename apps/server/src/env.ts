import { z } from "zod";
import { logger } from "./utils/logger";

/**
 * Environment variables schema definition.
 */
const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  DATABASE_URL: z.url(),
  CACHE_URL: z.url(),

  JWT_SECRET: z
    .string()
    .min(32, "JWT_SECRET should be at least 32 characters for security"),

  S3_ENDPOINT: z.url(),
  S3_ACCESS_KEY_ID: z.string().min(1),
  S3_SECRET_ACCESS_KEY: z.string().min(1),
  S3_REGION: z.string().min(1),
  S3_BUCKET: z.string().min(1),

  ADMIN_EMAIL: z.email(),
  ADMIN_PASSWORD: z
    .string()
    .min(8, "ADMIN_PASSWORD must be at least 8 characters"),
});

/**
 * Type-safe environment variables.
 */
export type Env = z.infer<typeof envSchema>;

/**
 * Validates the current process environment against the schema.
 * Throws an error with detailed information if validation fails.
 */
export function checkEnv(): void {
  const result = envSchema.safeParse(process.env);
  if (!result.success) {
    const { issues } = result.error;
    logger.error("Invalid environment variables:");
    for (const issue of issues) {
      logger.error(`${issue.path.join(".")}: ${issue.message}`);
    }
    process.exit(1);
  }
  logger.info("Environment variables validated successfully.");
}

declare global {
  namespace NodeJS {
    interface ProcessEnv extends Env {}
  }
}
