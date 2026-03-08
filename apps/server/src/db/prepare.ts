import { migrate } from "drizzle-orm/node-postgres/migrator";
import { isProduction } from "elysia/error";
import { hashPassword } from "../utils/crypto";
import { logger } from "../utils/logger";
import { db } from ".";
import { schema } from "./schema";

export async function prepareDatabase() {
  logger.info("Preparing database");
  try {
    logger.info("Running migrations");
    const failResponse = await runMigrations();
    if (failResponse) {
      logger.error(failResponse, "Migration failed");
      throw failResponse;
    }
    logger.info("Migrations complete");

    await createAdminUserIfNotExists();
  } catch (error) {
    logger.fatal(error, "Database preparation failed");
    process.exit(1);
  }
}

async function runMigrations() {
  return migrate(db, {
    migrationsFolder: isProduction ? "migrations" : "drizzle",
  });
}

async function createAdminUserIfNotExists() {
  logger.info("Checking if admin user exists");
  const admins = await db.query.users.findMany({
    where: {
      status: "active",
      access: { admin: true },
    },
  });
  const adminsCount = admins.length;
  if (adminsCount > 0) {
    logger.info("Admin user already exists");
    return;
  }

  logger.info("Creating admin user and profile");

  const email = process.env.ADMIN_EMAIL.toLowerCase();
  const passwordHash = await hashPassword(process.env.ADMIN_PASSWORD);

  await db.transaction(async (tx) => {
    logger.info("Creating admin user");
    const user = await tx
      .insert(schema.users)
      .values({ email, passwordHash, status: "active" })
      .returning()
      .then((rows) => rows[0]);
    if (!user) {
      logger.error("Failed to create admin user");
      return tx.rollback();
    }
    logger.info("Admin user created");

    logger.info("Creating admin access");
    const access = await tx
      .insert(schema.accesses)
      .values({
        userId: user.userId,
        admin: true,
      })
      .returning()
      .then((rows) => rows[0]);
    if (!access) {
      logger.error("Failed to create admin access");
      return tx.rollback();
    }
    logger.info("Admin access created");

    logger.info("Creating admin profile");
    const profile = await tx
      .insert(schema.profiles)
      .values({ userId: user.userId, name: "Admin User" })
      .returning()
      .then((rows) => rows[0]);
    if (!profile) {
      logger.error("Failed to create admin profile");
      return tx.rollback();
    }
    logger.info("Admin profile created");
  });
}
