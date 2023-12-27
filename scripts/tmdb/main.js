import { tmdb } from "../config.js";

export function getApiUrl() {
    return `${tmdb.api.url}/${tmdb.api.version}`;
}

export function getImageUrl(path, type = "poster") {
    return `${tmdb.image.url}/${tmdb.image[type]}${path}`;
}

export function sortByPopularity(obj) {
    return obj.sort((a, b) => b.popularity - a.popularity);
}

export async function sendRequest(path, parameters = {}, method = "GET") {
    const apiUrl = getApiUrl();
    const url = new URL(`${apiUrl}/${path}`);

    url.searchParams.append("api_key", tmdb.api.key);
    url.searchParams.append("language", tmdb.language);

    Object.entries(parameters).forEach(([key, value]) => {
        url.searchParams.append(key, value);
    });

    const response = await fetch(url, { method, headers : { accept: "application/json" } });

    if (response.status !== 200) {
        return;
    }

    let json;

    try { json = await response.json() }
    catch { return };

    return json;
}