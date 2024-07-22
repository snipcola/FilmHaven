import { providers as _providers } from "../../config.js";
import { check } from "../other/check.js";

export async function onRequest(req, reply) {
  // Parameters
  const data = req.query.data;

  // Empty Check
  if (data === "") {
    return btoa(encodeURIComponent(JSON.stringify({ success: false })));
  }

  // Parse Data
  let action;
  let info;

  try {
    const result = JSON.parse(decodeURIComponent(atob(data)));

    if (
      !result ||
      typeof result.action !== "string" ||
      typeof result.data !== "object" ||
      !["providers", "embed"].includes(result.action)
    ) {
      return btoa(encodeURIComponent(JSON.stringify({ success: false })));
    }

    action = result.action;
    info = result.data;
  } catch {
    return btoa(encodeURIComponent(JSON.stringify({ success: false })));
  }

  // Check Action
  if (action === "providers") {
    if (
      !info ||
      typeof info.type !== "string" ||
      typeof info.id !== "string" ||
      typeof info.imdbId !== "string" ||
      (info.type !== "movie" &&
        (typeof info.season !== "number" || typeof info.episode !== "number"))
    ) {
      return btoa(encodeURIComponent(JSON.stringify({ success: false })));
    }

    // Get Providers
    const promises = _providers
      .filter(
        (provider) =>
          typeof info.online !== "boolean" ||
          info.online === true ||
          provider.online !== true,
      )
      .map(function (provider) {
        return new Promise(async function (res) {
          const response =
            provider[provider.type]?.constructor?.name === "AsyncFunction"
              ? await provider[provider.type](info.type, info)
              : provider[provider.type](info.type, info);
          const valid =
            response &&
            (provider.type === "data" ||
              (await check(response, provider.base)));

          res(
            valid
              ? {
                  name: provider.base,
                  type: provider.type,
                  [provider.type]: response,
                }
              : null,
          );
        });
      });
    const providers = (await Promise.all(promises)).filter((p) => p !== null);

    // Return
    return btoa(
      encodeURIComponent(JSON.stringify({ success: true, providers })),
    );
  }
}
