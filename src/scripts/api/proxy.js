import { proxy } from "../config";

async function isValidUrl(url) {
    if (window.fhPortable) return true;
    let response;

    try { response = await fetch(proxy.url(url)) }
    catch { return false };

    return response.ok || response.status === 200;
}