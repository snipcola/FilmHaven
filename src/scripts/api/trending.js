import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber } from "../functions.js";
import { setCache, getCache } from "../cache.js";
import { config, api } from "../config.js";

function format(obj, type, genre) {
  return obj
    ? sortByPopularity(obj)
        .filter((i) => i.poster_path && i.backdrop_path)
        .map(function (item, index) {
          const dateString = item.release_date || item.first_air_date;
          const date = new Date(dateString);

          let description = item.overview || item.description;
          if (description)
            description =
              description.length > config.maxDescriptionLength
                ? description
                    .substring(0, config.maxDescriptionLength)
                    .replace(/\s+\S*$/, "...")
                : description;

          return !genre && index < config.carousel.amount
            ? {
                id: item.id?.toString(),
                type,
                title: item.title || item.name,
                description,
                backdrop: getImageUrl(item.backdrop_path, "backdrop"),
              }
            : {
                id: item.id?.toString(),
                type,
                title: item.title || item.name,
                image: getImageUrl(item.poster_path, "poster"),
                date: dateString
                  ? `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
                  : null,
                rating: (Math.round(item.vote_average) / 2).toString(),
                stars: shortenNumber(item.vote_count, 1),
              };
        })
    : null;
}

export async function getTrending(type = "movie", genre) {
  const cacheName = genre ? `trending-${type}-${genre}` : `trending-${type}`;
  const cache = getCache(cacheName);

  if (cache) return cache;

  const date = new Date();
  const formattedDateNow = date.toISOString().split("T")[0];

  date.setFullYear(date.getFullYear() - 5);
  const formattedDate = date.toISOString().split("T")[0];

  const response = genre
    ? await sendRequest(`discover/${type}`, {
        sort_by: "popularity.desc",
        ...(genre && { with_genres: genre }),
        "primary_release_date.gte": formattedDate,
        "primary_release_date.lte": formattedDateNow,
        "first_air_date.gte": formattedDate,
        "first_air_date.lte": formattedDateNow,
      })
    : await sendRequest(`trending/${type}/${api.trending.timeWindow}`);

  const json = format(response?.results, type, genre);

  setCache(cacheName, json);
  return json;
}
