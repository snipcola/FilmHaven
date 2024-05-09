import config from "../other/config.js";
import { check } from "../other/check.js";

export function onRootRequest() {
    return { success: true, providers: config.providers.map((p) => p.base) };
}

export async function onRequest(type, req) {
    // Provider Check
    const provider = config.providers.find((p) => p.base === req.params.provider);
    if (!provider) return { success: false, message: "Unsupported provider" };

    // Parameters
    const id = req.params.id;
    const imdbId = req.params.imdbId;
    const season = req.params.season;
    const episode = req.params.episode;

    // Empty Check
    if (id === "" || imdbId === "" || season === "" || episode === "") {
        return { success: false, message: "Missing parameters" };
    }

    // URL
    const url = provider.url(type, { id, imdbId, season, episode });

    // Return
    return await check(url, provider.base)
        ? { success: true, url }
        : { success: false };
}