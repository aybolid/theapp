import {
  type F1Driver,
  type F1Session,
  f1DriverSchema,
  f1SessionSchema,
  type SessionResult,
  sessionResultSchema,
} from "@theapp/schemas";
import z from "zod";
import { logger } from "../utils/logger";
import { cache } from ".";

export async function cacheF1Session(session: F1Session): Promise<void> {
  try {
    const json = JSON.stringify(session);
    await cache.set(`f1:session:${session.session_key}`, json);
    await cache.expire(`f1:session:${session.session_key}`, 3600 * 24);
  } catch (error) {
    logger.error({ error, session }, "Failed to cache F1 session");
  }
}

export async function getCachedF1Session(
  sessionKey: number,
): Promise<F1Session | undefined> {
  try {
    const json = await cache.get(`f1:session:${sessionKey}`);
    const session = json ? JSON.parse(json) : undefined;

    const parsed = await f1SessionSchema.safeParseAsync(session);
    if (parsed.error) {
      logger.error(
        { error: parsed.error, sessionKey },
        "Failed to parse cached F1 session",
      );
      return undefined;
    } else {
      logger.debug(
        { sessionKey, session: parsed.data },
        "F1 session from cache",
      );
    }

    return parsed.data;
  } catch (error) {
    logger.error({ error, sessionKey }, "Failed to get cached F1 session");
    return undefined;
  }
}

export async function cacheF1Sessions(
  year: number,
  sessions: F1Session[],
): Promise<void> {
  try {
    const json = JSON.stringify(sessions);
    await cache.set(`f1:sessions:${year}`, json);
    await cache.expire(`f1:sessions:${year}`, 3600 * 24);
  } catch (error) {
    logger.error({ error, year }, "Failed to cache F1 sessions");
  }
}

export async function getCachedF1Sessions(
  year: number,
): Promise<F1Session[] | undefined> {
  try {
    const json = await cache.get(`f1:sessions:${year}`);
    const sessions = json ? JSON.parse(json) : undefined;

    const parsed = await z.array(f1SessionSchema).safeParseAsync(sessions);
    if (parsed.error) {
      logger.error(
        { error: parsed.error, year },
        "Failed to parse cached F1 sessions",
      );
    } else {
      logger.debug(
        { year, sessionsLength: parsed.data.length },
        "F1 sessions from cache",
      );
    }

    return parsed.data;
  } catch (error) {
    logger.error({ error, year }, "Failed to get cached F1 sessions");
    return undefined;
  }
}

export async function cacheF1SessionDrivers(
  sessionKey: number,
  drivers: F1Driver[],
): Promise<void> {
  try {
    const json = JSON.stringify(drivers);
    await cache.set(`f1:drivers:${sessionKey}`, json);
    await cache.expire(`f1:drivers:${sessionKey}`, 3600 * 24);
  } catch (error) {
    logger.error({ error, sessionKey }, "Failed to cache F1 drivers");
  }
}

export async function getCachedF1SessionDrivers(
  sessionKey: number,
): Promise<F1Driver[] | undefined> {
  try {
    const json = await cache.get(`f1:drivers:${sessionKey}`);
    const drivers = json ? JSON.parse(json) : undefined;

    const parsed = await z.array(f1DriverSchema).safeParseAsync(drivers);
    if (parsed.error) {
      logger.error(
        { error: parsed.error, sessionKey },
        "Failed to parse cached F1 drivers",
      );
    } else {
      logger.debug(
        { sessionKey, driversLength: parsed.data.length },
        "F1 drivers from cache",
      );
    }

    return parsed.data;
  } catch (error) {
    logger.error({ error, sessionKey }, "Failed to get cached F1 drivers");
    return undefined;
  }
}

export async function cacheF1SessionResults(
  sessionKey: number,
  results: SessionResult[],
): Promise<void> {
  try {
    const json = JSON.stringify(results);
    await cache.set(`f1:results:${sessionKey}`, json);
    await cache.expire(`f1:results:${sessionKey}`, 3600 * 24);
  } catch (error) {
    logger.error({ error, sessionKey }, "Failed to cache F1 session results");
  }
}

export async function getCachedF1SessionResults(
  sessionKey: number,
): Promise<SessionResult[] | undefined> {
  try {
    const json = await cache.get(`f1:results:${sessionKey}`);
    const results = json ? JSON.parse(json) : undefined;

    const parsed = await z.array(sessionResultSchema).safeParseAsync(results);
    if (parsed.error) {
      logger.error(
        { error: parsed.error, sessionKey },
        "Failed to parse cached F1 session results",
      );
    } else {
      logger.debug(
        { sessionKey, resultsLength: parsed.data.length },
        "F1 session results from cache",
      );
    }

    return parsed.data;
  } catch (error) {
    logger.error(
      { error, sessionKey },
      "Failed to get cached F1 session results",
    );
    return undefined;
  }
}
