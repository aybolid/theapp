import { RedisClient } from "bun";

export const cache = new RedisClient(process.env.CACHE_URL);
