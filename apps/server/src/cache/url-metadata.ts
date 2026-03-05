import { type UrlMetadata, urlMetadataSchema } from "@theapp/schemas";
import { logger } from "../utils/logger";
import { cache } from ".";

export async function cacheUrlMetadata(
  url: string,
  metadata: UrlMetadata,
): Promise<void> {
  await cache.hset(url, metadata);
  await cache.expire(url, 3600 * 24);
  logger.debug({ url, metadata }, "URL metadata cached");
}

export async function getCachedUrlMetadata(
  url: string,
): Promise<UrlMetadata | undefined> {
  const cached = await cache.hgetall(url);
  if (Object.keys(cached).length === 0) {
    return undefined;
  }

  const parsed = await urlMetadataSchema.safeParseAsync(cached);
  if (parsed.error) {
    logger.error(
      { error: parsed.error, url },
      "Failed to parse cached url metadata",
    );
  } else {
    logger.debug({ url, metadata: parsed.data }, "URL metadata from cache");
  }

  return parsed.data;
}
