import { type UrlMetadata, urlMetadataSchema } from "@theapp/schemas";
import { logger } from "../utils/logger";
import { cache } from ".";

/**
 * Cache TTL for URL metadata: 24 hours.
 */
const METADATA_CACHE_TTL_SECONDS = 3600 * 24;

/**
 * Stores URL metadata in the cache with a predefined TTL.
 *
 * @param url The URL to cache metadata for.
 * @param metadata The metadata object to store.
 */
export async function cacheUrlMetadata(
  url: string,
  metadata: UrlMetadata,
): Promise<void> {
  try {
    await cache.hset(url, metadata);
    await cache.expire(url, METADATA_CACHE_TTL_SECONDS);
    logger.debug({ url, metadata }, "URL metadata successfully cached");
  } catch (error) {
    logger.error({ error, url }, "Failed to cache URL metadata");
  }
}

/**
 * Retrieves cached URL metadata if it exists and is valid.
 * Returns undefined if no cache entry is found or if parsing fails.
 *
 * @param url The URL to retrieve metadata for.
 * @returns The cached UrlMetadata or undefined.
 */
export async function getCachedUrlMetadata(
  url: string,
): Promise<UrlMetadata | undefined> {
  try {
    const cached = await cache.hgetall(url);
    if (Object.keys(cached).length === 0) {
      return undefined;
    }

    const result = await urlMetadataSchema.safeParseAsync(cached);
    if (result.success) {
      logger.debug(
        { url, metadata: result.data },
        "Successfully retrieved URL metadata from cache",
      );
      return result.data;
    }

    logger.error(
      { error: result.error, url },
      "Found corrupted URL metadata in cache; ignoring entry",
    );

    return undefined;
  } catch (error) {
    logger.error(
      { error, url },
      "Unexpected error retrieving URL metadata from cache",
    );
    return undefined;
  }
}
