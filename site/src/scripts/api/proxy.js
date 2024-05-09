import { isLocal } from "../functions.js";

const local = isLocal();

export async function isValidProxy(proxy) {
    try {
        const response = await fetch(proxy);
        const json = await response.json();

        return json.success
            ? json.providers.filter((provider) => typeof provider.local === "boolean"
                ? (local ? provider.local : true)
                : true)
            : false;
    } catch {
        return false;
    }
}

export async function isValidUrl(proxy, provider, info, season, episode) {        
    try {
        const url = (info.type === "movie")
            ? `${proxy}/${provider}/${info.id}/${info.imdbId}`
            : `${proxy}/${provider}/${info.id}/${season}/${episode}/${info.imdbId}`;

        const response = await fetch(url);
        const json = await response.json();

        return json.success
            ? json.url
            : false;
    } catch {
        return false;
    }
}