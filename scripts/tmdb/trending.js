import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber } from "../functions.js";
import { setCache, getCache } from "../cache.js";
import { tmdb } from "../config.js";

function format(obj, type) {
    return obj
        ? sortByPopularity(obj).filter((i) => i.poster_path && i.backdrop_path).map(function (item) {
            const dateString = item.release_date || item.first_air_date;
            const date = new Date(dateString);

            return {
                id: item.id?.toString(),
                type,
                title: item.title || item.name,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                backdrop: getImageUrl(item.backdrop_path, "backdrop"),
                date: dateString ? `${date.getFullYear()}-${date.getMonth().toString().padStart(2, "0")}` : null,
                rating: Math.round(item.vote_average / 2).toString(),
                stars: shortenNumber(item.vote_count, 1)
            };
        })
        : null;
}

export async function getTrending(type = "movie", genre) {
    const cacheName = `trending-${type}`;
    const cache = getCache(cacheName);

    if (cache && !genre) return cache;

    const date = new Date();
    const formattedDateNow = date.toISOString().split("T")[0];
    
    date.setFullYear(date.getFullYear() - 5);
    const formattedDate = date.toISOString().split("T")[0];
    
    const response = genre
        ?  await sendRequest(`discover/${type}`, {
                sort_by: "popularity.desc",
                with_genres: genre,
                "primary_release_date.gte": formattedDate,
                "primary_release_date.lte": formattedDateNow,
                "first_air_date.gte": formattedDate,
                "first_air_date.lte": formattedDateNow
            })
        : await sendRequest(`trending/${type}/${tmdb.trending.timeWindow}`);

    const json = format(response?.results, type);

    if (!genre) {
        setCache(cacheName, json);
    }

    return json;
}