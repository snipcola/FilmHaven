import { sendRequest } from "./main.js";
import { setCache, getCache } from "../cache.js";

export async function getGenres(type = "movie") {
  const cacheName = `genres-${type}`;
  const cache = getCache(cacheName);

  if (cache) return cache;

  const response = await sendRequest(`genre/${type}/list`);
  const json = response?.genres;

  setCache(cacheName, json);
  return json;
}
