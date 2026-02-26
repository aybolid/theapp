import {
  getUrlMetadataQuerySchema,
  type UrlMetadata,
  urlMetadataSchema,
} from "@theapp/schemas";
import * as cheerio from "cheerio";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";

async function extractMetadata(url: string): Promise<UrlMetadata> {
  const response = await fetch(url.trim());
  if (!response.ok) {
    throw new Error("Failed to fetch url");
  }
  const content = await response.text();

  const $ = cheerio.load(content);
  const head = $("head");
  const title = head.find("title").text();
  const description = head.find("meta[name=description]").attr("content") || "";
  const banner =
    head.find('meta[name="og:image"]').attr("content") ||
    head.find('meta[property="og:image"]').attr("content") ||
    "";

  return {
    title,
    description,
    banner,
  };
}

export const misc = new Elysia({
  prefix: "/misc",
  detail: {
    tags: ["misc"],
  },
})
  .use(authGuard())
  .get(
    "url-metadata",
    async (ctx) => {
      const metadata = await extractMetadata(ctx.query.url);
      return ctx.status(200, metadata);
    },
    {
      query: getUrlMetadataQuerySchema,
      response: { 200: urlMetadataSchema },
      detail: {
        description: "Extract url metdata",
      },
    },
  );
