import caching from "@fastify/caching";
import abstractCache from "abstract-cache";

function getTTL(time) {
  return (time || 300) * 60;
}

export default async function (server, time) {
  const cache = abstractCache({ useAwait: true });
  await server.register(caching, { cache, expiresIn: getTTL(time) });
}

function parseInfo(info) {
  return info.type === "movie"
    ? `${info.id}/${info.imdbId}`
    : `${info.id}/${info.imdbId}/${info.season}/${info.episode}`;
}

export async function getCache(cache, info) {
  const name = parseInfo(info);

  try {
    return await cache.get(name);
  } catch {
    return false;
  }
}

export async function setCache(cache, info, providers) {
  const name = parseInfo(info);
  const ttl = getTTL(process.env.CACHE_TIMEOUT) * 1000;

  try {
    await cache.set(name, providers, ttl);
    return true;
  } catch {
    return false;
  }
}
