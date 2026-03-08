import {
  f1DriverChampionshipStandingsSchema,
  f1DriversSchema,
  f1SessionResults,
  f1SessionSchema,
  f1SessionsSchema,
  getSessionByKeyNotFoundErrorSchema,
  getSessionByKeyParamsSchema,
  getSessionDriversParamsSchema,
  getSessionResultsParamsSchema,
} from "@theapp/schemas";
import {
  fetchF1DriverChampionshipStandings,
  fetchF1SeasonSessions,
  fetchF1SessionByKey,
  fetchF1SessionDrivers,
  fetchF1SessionResults,
} from "@theapp/server/services/f1";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const f1 = new Elysia({
  prefix: "/f1",
  detail: {
    tags: ["f1"],
  },
})
  .use(authGuard({ access: ["f1"] }))
  .get(
    "/championship/drivers",
    async (ctx) => {
      const data = await fetchF1DriverChampionshipStandings();
      return ctx.status(200, data);
    },
    {
      response: {
        200: f1DriverChampionshipStandingsSchema,
      },
      detail: {
        description:
          "Get the driver championship standings for the current season.",
      },
    },
  )
  .get(
    "/sessions/:sessionKey",
    async (ctx) => {
      const session = await fetchF1SessionByKey(ctx.params.sessionKey);
      if (!session) throw ctx.status(404, "Session not found");
      return ctx.status(200, session);
    },
    {
      params: getSessionByKeyParamsSchema,
      response: {
        404: getSessionByKeyNotFoundErrorSchema,
        200: f1SessionSchema,
      },
      detail: {
        description: "Get an F1 session by its key.",
      },
    },
  )
  .get(
    "/sessions/:sessionKey/drivers",
    async (ctx) => {
      const drivers = await fetchF1SessionDrivers(ctx.params.sessionKey);
      return ctx.status(200, drivers);
    },
    {
      params: getSessionDriversParamsSchema,
      response: {
        200: f1DriversSchema,
      },
      detail: {
        description:
          "Get drivers who participated in the session with the given session key.",
      },
    },
  )
  .get(
    "/sessions/:sessionKey/results",
    async (ctx) => {
      const results = await fetchF1SessionResults(ctx.params.sessionKey);
      return ctx.status(200, results);
    },
    {
      params: getSessionResultsParamsSchema,
      response: {
        200: f1SessionResults,
      },
      detail: {
        description: "Get results for the session with the given session key.",
      },
    },
  )
  .get(
    "/sessions",
    async (ctx) => {
      const sessions = await fetchF1SeasonSessions(new Date().getFullYear());
      return ctx.status(200, sessions);
    },
    {
      response: {
        200: f1SessionsSchema,
      },
      detail: {
        description: "Get F1 sessions for the current year.",
      },
    },
  );
