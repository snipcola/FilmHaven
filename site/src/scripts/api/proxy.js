export async function isValidProxy(proxy) {
    try {
        const response = await fetch(proxy, { method: "POST" });
        const json = await response.json();

        return json.success
            ? json.providers
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

        const response = await fetch(url, { method: "POST" });
        const json = await response.json();

        return json.success
            ? json.url
            : false;
    } catch {
        return false;
    }
}