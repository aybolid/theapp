import { getF1SessionsResponseSchema } from "@theapp/schemas";
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
    "/sessions",
    async (ctx) => {
      const currentYear = new Date().getFullYear();
      const response = await fetch(
        `${F1_API_BASE_URL}/sessions?year=${currentYear}`,
      );
      if (!response.ok) {
        throw new Error("Failed to fetch f1 sessions");
      }

      const data = await response.json();

      return ctx.status(
        200,
        // biome-ignore lint/suspicious/noExplicitAny: see f1 api spec
        data.map((s: any) => ({
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
