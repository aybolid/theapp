import {
  type F1Driver,
  type F1Session,
  f1SessionSchema,
  getF1SessionsResponseSchema,
  getSessionByKeyNotFoundErrorSchema,
  getSessionByKeyParamsSchema,
  getSessionDriversParamsSchema,
  getSessionDriversResponseSchema,
  getSessionResultsParamsSchema,
  getSessionResultsResponseSchema,
  type SessionResult,
} from "@theapp/schemas";
import { logger } from "@theapp/server/utils/logger";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

const F1_API_BASE_URL = "https://api.openf1.org/v1";

export const f1 = new Elysia({
  prefix: "/f1",
  detail: {
    tags: ["f1"],
  },
})
  .use(authGuard())
  .get(
    "/sessions/:sessionKey",
    async (ctx) => {
      const sessionKey = ctx.params.sessionKey;
      const response = await fetch(
        `${F1_API_BASE_URL}/sessions?session_key=${sessionKey}`,
      );
      if (!response.ok) {
        logger.error(
          { error: await response.json() },
          "Failed to fetch f1 session",
        );
        throw new Error("Failed to fetch f1 session");
      }
      const data: F1Session[] = await response.json();
      const session = data[0];
      if (!session) {
        throw ctx.status(404, "Session not found");
      }

      return ctx.status(200, {
        ...session,
        date_start: new Date(session.date_start).toISOString(),
        date_end: new Date(session.date_end).toISOString(),
      });
    },
    {
      params: getSessionByKeyParamsSchema,
      response: {
        404: getSessionByKeyNotFoundErrorSchema,
        200: f1SessionSchema,
      },
      detail: {
        description: "Get a single f1 session by session key",
      },
    },
  )
  .get(
    "/sessions/:sessionKey/drivers",
    async (ctx) => {
      const sessionKey = ctx.params.sessionKey;
      const response = await fetch(
        `${F1_API_BASE_URL}/drivers?session_key=${sessionKey}`,
      );
      if (!response.ok) {
        logger.error(
          { error: await response.json() },
          "Failed to fetch f1 session drivers",
        );
        throw new Error("Failed to fetch f1 session drivers");
      }
      const data: F1Driver[] = await response.json();

      return ctx.status(200, data);
    },
    {
      params: getSessionDriversParamsSchema,
      response: {
        200: getSessionDriversResponseSchema,
      },
      detail: {
        description: "Get f1 session drivers",
      },
    },
  )
  .get(
    "/sessions/:sessionKey/results",
    async (ctx) => {
      const sessionKey = ctx.params.sessionKey;
      const response = await fetch(
        `${F1_API_BASE_URL}/session_result?session_key=${sessionKey}`,
      );
      if (!response.ok) {
        logger.error(
          { error: await response.json() },
          "Failed to fetch f1 session results",
        );
        throw new Error("Failed to fetch f1 session results");
      }
      const data: SessionResult[] = await response.json();

      return ctx.status(200, data);
    },
    {
      params: getSessionResultsParamsSchema,
      response: {
        200: getSessionResultsResponseSchema,
      },
      detail: {
        description: "Get f1 session results",
      },
    },
  )
  .get(
    "/sessions",
    async (ctx) => {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${F1_API_BASE_URL}/sessions?year=${currentYear}`,
      );
      if (!response.ok) {
        logger.error(
          { error: await response.json() },
          "Failed to fetch f1 sessions",
        );
        throw new Error("Failed to fetch f1 sessions");
      }

      const data: F1Session[] = await response.json();

      return ctx.status(
        200,
        data.map((s) => ({
          ...s,
          date_start: new Date(s.date_start).toISOString(),
          date_end: new Date(s.date_end).toISOString(),
        })),
      );
    },
    {
      response: {
        200: getF1SessionsResponseSchema,
      },
      detail: {
        description: "Get all f1 sessions for the current year",
      },
    },
  );
