import { sendRequest, getImageUrl } from "./main.js";
import { setCache, getCache } from "../cache.js";

function format(obj) {
    return obj.results
        ? obj.results.map(function (item) {
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

export async function getTrending(type = "movie", time_window = "day") {
    const cacheName = `trending-${type}`;
    const cache = getCache(cacheName);
    if (cache) return cache;
    
    const response = format(await sendRequest(`trending/${type}/${time_window}`));
    setCache(cacheName, response);

    return response;
}