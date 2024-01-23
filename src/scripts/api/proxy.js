import { proxy } from "../config";

export async function isValidUrl(url) {
    let response;

    try {
        response = await Promise.race([
            fetch(proxy.url(url)),
            new Promise((resolve) => setTimeout(resolve, proxy.timeout))
        ]);
    } catch {
        return true;
    }

    const isOk = response && (response.ok || !(proxy.blacklisted.status).includes(response.status));

    if (isOk) {
        const text = await response.text();

        if (text) {
            for (const blacklistedText of proxy.blacklisted.text) {
                if (text.toLowerCase().includes(blacklistedText)) {
                    return false;
                }
            }
        }
    }

    return isOk;
}