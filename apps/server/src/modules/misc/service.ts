import type { UrlMetadata } from "@theapp/schemas";
import { load } from "cheerio";

export async function fetchHtml(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch url");
  return await response.text();
}

export async function parseMetadata(html: string): Promise<UrlMetadata> {
  const $ = load(html);
  const head = $("head");
  const title = head.find("title").text();
  const description = head.find("meta[name=description]").attr("content") || "";
  const banner =
    head.find('meta[name="og:image"]').attr("content") ||
    head.find('meta[property="og:image"]').attr("content") ||
    "";
  return { title, description, banner };
}
