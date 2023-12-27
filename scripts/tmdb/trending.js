import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { setCache, getCache } from "../cache.js";
import { tmdb } from "../config.js";

function format(obj) {
    return obj.results
        ? sortByPopularity(obj.results).map(function (item) {
            return {
                id: item.id,
                type: item.media_type,
                title: item.title || item.name,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                backdrop: getImageUrl(item.backdrop_path, "backdrop")
            };
        })
        : [];
}

export async function getTrending(type = "movie") {
    const cacheName = `trending-${type}`;
    const cache = getCache(cacheName);
    if (cache) return cache;
    
    const response = format(await sendRequest(`trending/${type}/${tmdb.trending.timeWindow}`));
    setCache(cacheName, response);

    return response;
}