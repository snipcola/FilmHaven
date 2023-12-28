import { sendRequest, getImageUrl, sortByPopularity } from "./main.js";
import { setCache, getCache } from "../cache.js";

function format(obj, type) {
    return obj
        ? sortByPopularity(obj).filter((i) => i.poster_path).map(function (item) {
            return {
                id: item.id?.toString(),
                type,
                description: item.overview || item.description,
                image: getImageUrl(item.poster_path, "poster"),
                date: item.release_date || item.first_air_date
            };
        })
        : null;
}

export async function getNew(type = "movie") {
    const cacheName = `new-${type}`;
    const cache = getCache(cacheName);

    if (cache) return cache;
    
    const date = new Date();
    const formattedDateNow = date.toISOString().split('T')[0];
    
    date.setMonth(date.getMonth() - 1);
    const formattedDate = date.toISOString().split('T')[0];
    
    const response = await sendRequest(`discover/${type}`, {
        sort_by: "popularity.desc",
        "primary_release_date.gte": formattedDate,
        "primary_release_date.lte": formattedDateNow,
        "first_air_date.gte": formattedDate,
        "first_air_date.lte": formattedDateNow
    });
    
    const json = format(response?.results, type);

    setCache(cacheName, json);
    return json;
}