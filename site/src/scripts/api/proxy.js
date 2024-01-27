export async function isValidProxy(proxy) {
    let response;
    let json;

    try { response = await fetch(proxy.base) }
    catch { return false };
    
    try { json = await response.json() }
    catch { return false };

    return json?.success !== null && json?.message !== null;
}

export async function isValidUrl(proxy, url) {
    let response;

    try { response = await fetch(proxy.url(url)) }
    catch {};

    return response
        ? response.status === 200
        : true;
}