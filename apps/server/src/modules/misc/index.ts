import { getUrlMetadataQuerySchema, urlMetadataSchema } from "@theapp/schemas";
import * as cheerio from "cheerio";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

export const misc = new Elysia({
  prefix: "/misc",
  detail: {
    tags: ["misc"],
  },
})
  .use(authGuard())
  .get(
    "/url-metadata",
    async (ctx) => {
      const response = await fetch(ctx.query.url.trim());
      if (!response.ok) {
        throw new Error("Failed to fetch url");
      }
      const content = await response.text();

      const $ = cheerio.load(content);
      const head = $("head");
      const title = head.find("title").text();
      const description =
        head.find("meta[name=description]").attr("content") || "";
      const banner =
        head.find('meta[name="og:image"]').attr("content") ||
        head.find('meta[property="og:image"]').attr("content") ||
        "";

      return ctx.status(200, { title, description, banner });
    },
    {
      query: getUrlMetadataQuerySchema,
      response: { 200: urlMetadataSchema },
      detail: {
        description:
          "Fetch metadata (title, description, og:image) from a URL.",
      },
    },
  );
