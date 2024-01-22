import { proxy } from "../config";

export async function isValidUrl(url) {
    if (window.fhPortable) return true;
    let response;

    try {
        response = await Promise.race([
            fetch(proxy.url(url)),
            new Promise((resolve) => setTimeout(resolve, 3500))
        ]);
    } catch {
        return true;
    }

    return response && (response.ok || [200, 500, 401, 403].includes(response.status));
}