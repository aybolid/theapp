import { getUrlMetadata } from "@theapp/schemas";
import {
  cacheUrlMetadata,
  getCachedUrlMetadata,
} from "@theapp/server/cache/url-metadata";
import Elysia from "elysia";
import { authGuard } from "../auth/guard";
import { fetchHtml, parseMetadata } from "./service";

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
      const metadata = await fetchHtml(url).then(parseMetadata);
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
