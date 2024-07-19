import config from "../../config.js";
import { check } from "../other/check.js";

export async function onRequest(type, req) {
  // Parameters
  const id = req.params.id;
  const imdbId = req.params.imdbId;
  const season = req.params.season;
  const episode = req.params.episode;
  const online = req.params.online;

  // Empty Check
  if (id === "" || imdbId === "" || season === "" || episode === "") {
    return { success: false, message: "Missing parameters" };
  }

  // Get Providers
  const promises = config.providers
    .filter((provider) =>
      typeof online !== "string"
        ? true
        : online === "true"
          ? true
          : provider.online !== true,
    )
    .map(function (provider) {
      return new Promise(async function (res) {
        const url = provider.url(type, { id, imdbId, season, episode });
        const valid = await check(url, provider.base);

        res(valid ? { provider: provider.base, url } : null);
      });
    });
  const providers = (await Promise.all(promises)).filter((p) => p !== null);

  // Return
  return { success: true, providers };
}
