import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { shortenNumber } from "../functions.js";
import { setCache, getCache } from "../cache.js";
import { tmdb } from "../config.js";

function format(obj) {
    return obj
        ? sortByPopularity(obj).map(function (item) {
            return {
                id: item.id?.toString(),
                type: item.media_type,
                title: item.title || item.name,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                backdrop: getImageUrl(item.backdrop_path, "backdrop"),
                date: item.release_date || item.first_air_date,
                rating: Math.round(item.vote_average / 2).toString(),
                stars: shortenNumber(item.vote_count)
            };
        })
        : [];
}

export async function getTrending(type = "movie") {
    const cacheName = `trending-${type}`;
    const cache = getCache(cacheName);

    if (cache) return cache;
    
    const response = await sendRequest(`trending/${type}/${tmdb.trending.timeWindow}`);
    const json = format(response?.results);

    setCache(cacheName, json);
    return json;
}