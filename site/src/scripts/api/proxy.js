export async function isValidProxy(proxy) {
    try {
        const response = await fetch(proxy);
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
        const response = (info.type === "movie")
            ? await fetch(`${proxy}/${provider}/${info.id}/${info.imdbId}`)
            : await fetch(`${proxy}/${provider}/${info.id}/${season}/${episode}/${info.imdbId}`);
        const json = await response.json();

        return json.success
            ? json.url
            : false;
    } catch {
        return false;
    }
}