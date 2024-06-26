import config from "../../config.js";
import fetch from "ky";

function promiseWithTimeout(promise, timeout) {
    return Promise.race([
        promise,
        new Promise(function (res) {
            setTimeout(res, (timeout || 5) * 1000);
        })
    ]);
}

async function get(url, base) {
    try {
        const headers = { "Origin": `https://${base}`, "Referer": `https://${base}/` };
        const response = await promiseWithTimeout(fetch.get(url, { headers }), process.env.TIMEOUT);
        const text = await response.text();

        return {
            status: response.status,
            text: text.toLowerCase() || ""
        };
    } catch {
        return null;
    }
}

export async function check(url, base) {
    const response = await get(url, base);
    
    switch (response) {
        case null:
            return false;
        default:
            const blacklistedStatus = config.blacklist.status.includes(response.status);
            const blacklistedText = config.blacklist.text.some((t) => response.text.includes(t));

            return !(blacklistedStatus || blacklistedText);
    }
}