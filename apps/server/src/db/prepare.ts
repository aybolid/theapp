import { migrate } from "drizzle-orm/node-postgres/migrator";
import { isProduction } from "elysia/error";
import { hashPassword } from "../utils/crypto";
import { logger } from "../utils/logger";
import { db } from ".";
import { schema } from "./schema";

/**
 * Prepares the database by running migrations and seeding the default admin user.
 */
export async function prepareDatabase() {
  logger.info("Preparing database...");
  try {
    await runMigrations();
    await seedAdminUser();
    logger.info("Database preparation complete.");
  } catch (error) {
    logger.fatal(error, "Database preparation failed. Terminating process.");
    process.exit(1);
  }
}

/**
 * Runs database migrations based on the environment.
 */
async function runMigrations() {
  logger.info("Running migrations...");
  const migrationsFolder = isProduction ? "migrations" : "drizzle";

  const migrationError = await migrate(db, { migrationsFolder });

  if (migrationError) {
    logger.error(migrationError, "Migration failed");
    throw migrationError;
  }

  logger.info("Migrations complete.");
}

/**
 * Ensures at least one admin user exists in the database.
 * If none are found, creates a default admin from environment variables.
 */
async function seedAdminUser() {
  logger.info("Checking for existing active admin users...");

  const admins = await db.query.users.findMany({
    where: {
      status: "active",
      access: { admin: true },
    },
  });

  if (admins.length > 0) {
    logger.info("Active admin user already exists.");
    return;
  }

  const email = process.env.ADMIN_EMAIL?.toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  logger.info({ email }, "Creating default admin user...");
  const passwordHash = await hashPassword(password);

  try {
    await db.transaction(async (tx) => {
      const [user] = await tx
        .insert(schema.users)
        .values({ email, passwordHash, status: "active" })
        .returning();

      if (!user) throw new Error("Failed to create admin user row");

      await tx.insert(schema.accesses).values({
        userId: user.userId,
        admin: true,
      });

      await tx.insert(schema.profiles).values({
        userId: user.userId,
        name: "Admin User",
      });
    });

    logger.info("Default admin user created successfully.");
  } catch (error) {
    logger.error(
      error,
      "Failed to seed default admin user during transaction.",
    );
    throw error;
  }
}
