import Elysia from "elysia";
import { pool } from "./db";
import { logger } from "./utils/logger";

export const lifecycleHandler = new Elysia()
  .on("start", async () => {
    logger.info("Server starting...");
  })
  .on("stop", async () => {
    logger.info("Server stopping. Closing database connections...");
    await pool.end();
    logger.info("Database connection pool closed.");
    process.exit(0);
  });

export const requestLogger = new Elysia()
  .onRequest(({ request }) => {
    logger.info(
      { method: request.method, url: request.url },
      "Incoming request.",
    );
  })
  .onAfterResponse(({ request, set }) => {
    logger.info(
      { method: request.method, url: request.url, status: set.status },
      "Response sent.",
    );
  })
  .onError((ctx) => {
    const logData = { code: ctx.code, error: ctx.error, url: ctx.request.url };
    if (typeof ctx.code !== "number" && ctx.code !== "VALIDATION") {
      logger.error(logData, "Request failed.");
    } else {
      logger.debug(logData, "Request failed (expected).");
    }
  });
