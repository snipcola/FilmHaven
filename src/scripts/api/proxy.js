import { proxy } from "../config";

export async function isValidUrl(url) {
    let response;

    try { response = fetch(proxy.url(url)) }
    catch {};

    return response
        ? response.status === 200
        : true;
}