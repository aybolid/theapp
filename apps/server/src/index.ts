import openapi from "@elysiajs/openapi";
import { auth } from "@theapp/server/modules/auth";
import { profiles } from "@theapp/server/modules/profiles";
import { count, eq } from "drizzle-orm";
import { migrate } from "drizzle-orm/node-postgres/migrator";
import { Elysia } from "elysia";
import { isProduction } from "elysia/error";
import z from "zod";
import { db, pool } from "./db";
import { schema } from "./db/schema";
import { checkEnv } from "./env";
import { invites } from "./modules/invites";
import { misc } from "./modules/misc";
import { users } from "./modules/users";
import { wishes } from "./modules/wishes";
import { logger } from "./utils/logger";

checkEnv();

const PORT = 3000;

async function setupDatabase() {
  try {
    logger.info("Migrating database");
    await migrate(db, {
      migrationsFolder: isProduction ? "migrations" : "drizzle",
    });
    logger.info("Database migration complete");

    const adminsCount = await db
      .select({ count: count() })
      .from(schema.users)
      .where(eq(schema.users.role, "admin"))
      .then((res) => res[0]?.count ?? 0);
    if (adminsCount === 0) {
      logger.info("No admins found, creating one");

      await db.transaction(async (tx) => {
        const passwordHash = Bun.password.hashSync(
          process.env.ADMIN_PASSWORD,
          "argon2id",
        );

        logger.info("Creating admin user");
        const user = await tx
          .insert(schema.users)
          .values({
            email: process.env.ADMIN_EMAIL.toLowerCase(),
            passwordHash,
            role: "admin",
          })
          .returning()
          .then((rows) => rows[0]);
        if (!user) {
          throw new Error("Failed to create user");
        }
        logger.info("Admin user created");

        logger.info("Creating admin profile");
        const profile = await tx
          .insert(schema.profiles)
          .values({ userId: user.userId, name: "Admin User" })
          .returning()
          .then((rows) => rows[0]);
        if (!profile) {
          throw new Error("Failed to create profile");
        }
        logger.info("Admin profile created");
      });
    }
    logger.info("Database setup complete");
  } catch (err) {
    logger.error({ error: err }, "Database setup failed");
    process.exit(1);
  }
}

async function startServer() {
  await setupDatabase();

  const api = new Elysia({ prefix: "/api" })
    .use(auth)
    .use(profiles)
    .use(wishes)
    .use(misc)
    .use(users)
    .use(invites);

  const app = new Elysia({ allowUnsafeValidationDetails: true })
    .on("stop", async () => {
      logger.info("Closing database connection...");
      await pool.end();
      logger.info("Database connection closed.");
      process.exit(0);
    })
    .onRequest(({ request }) => {
      logger.info(
        { method: request.method, url: request.url },
        "Incoming request",
      );
    })
    .onAfterResponse(({ request, set }) => {
      logger.info(
        { method: request.method, url: request.url, status: set.status },
        "Response sent",
      );
    })
    .onError((ctx) => {
      if (typeof ctx.code !== "number" && ctx.code !== "VALIDATION") {
        logger.error(
          { code: ctx.code, error: ctx.error, url: ctx.request.url },
          "Request failed",
        );
      } else {
        logger.debug(
          { code: ctx.code, error: ctx.error, url: ctx.request.url },
          "Request failed",
        );
      }
    })
    .use(
      openapi({
        mapJsonSchema: { zod: z.toJSONSchema },
        scalar: { agent: { disabled: true } },
      }),
    )
    .use(api)
    .listen(PORT);

  logger.info(
    `Server is running at ${app.server?.hostname}:${app.server?.port}`,
  );

  process.on("SIGINT", app.stop);
  process.on("SIGTERM", app.stop);

  return app;
}

startServer();

export type App = Awaited<ReturnType<typeof startServer>>;
