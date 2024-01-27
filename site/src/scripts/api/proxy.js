export async function isValidProxy(proxy) {
    try { await fetch(proxy.base) }
    catch { return false };

    return true;
}

export async function isValidUrl(proxy, url) {
    let response;

    try { response = await fetch(proxy.url(url)) }
    catch {};

    return response
        ? response.status === 200
        : true;
}