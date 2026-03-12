import { getUrlMetadata } from "@theapp/schemas";
import {
  cacheUrlMetadata,
  getCachedUrlMetadata,
} from "@theapp/server/cache/url-metadata";
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
      const url = ctx.query.url.trim();

      const cachedMetadata = await getCachedUrlMetadata(url);
      if (cachedMetadata) {
        return ctx.status(200, cachedMetadata);
      }

      const response = await fetch(url);
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

      const metadata = { title, description, banner };
      cacheUrlMetadata(url, metadata);
      return ctx.status(200, metadata);
    },
    {
      ...getUrlMetadata,
      detail: {
        description:
          "Fetch metadata (title, description, og:image) from a URL.",
      },
    },
  );
