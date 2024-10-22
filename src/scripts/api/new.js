import { sendRequest, getImageUrl } from "./main.js";
import { setCache, getCache } from "../cache.js";

function format(obj, type) {
  return obj
    ? obj
        .filter((i) => i.poster_path)
        .map(function (item) {
          return {
            id: item.id?.toString(),
            type,
            title: item.title || item.name,
            image: getImageUrl(item.poster_path, "poster"),
            date: item.release_date || item.first_air_date,
          };
        })
    : null;
}

export async function getNew(type = "movie", genre) {
  const cacheName = genre ? `new-${type}-${genre}` : `new-${type}`;
  const cache = getCache(cacheName);

  if (cache) return cache;

  const date = new Date();
  const formattedDateNow = date.toISOString().split("T")[0];

  date.setMonth(date.getMonth() - 5);
  const formattedDate = date.toISOString().split("T")[0];

  const response = await sendRequest(`discover/${type}`, {
    sort_by: "popularity.desc",
    ...(genre && { with_genres: genre }),
    "primary_release_date.gte": formattedDate,
    "primary_release_date.lte": formattedDateNow,
    "first_air_date.gte": formattedDate,
    "first_air_date.lte": formattedDateNow,
  });

  const json = format(response?.results, type);

  setCache(cacheName, json);
  return json;
}
