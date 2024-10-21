import { providers } from "../../config.js";
import { check } from "../other/check.js";
import { getCache, setCache } from "./cache.js";

function parse(providers) {
  return { success: true, providers };
}

export async function onRequest({ cache }, info, req) {
  const cached = await getCache(cache, info);

  if (cached?.item) {
    return parse(cached.item);
  }

  const promises = providers.map(function (provider) {
    return new Promise(async function (res) {
      const response =
        provider?.url?.constructor?.name === "AsyncFunction"
          ? await provider.url(info.type, info, req)
          : provider.url(info.type, info);

      const valid = response && (await check(response, provider.base));

      res(
        valid
          ? {
              name: provider.base,
              online: provider.online || false,
              url: response,
            }
          : null,
      );
    });
  });

  const urls = (await Promise.all(promises)).filter((p) => p !== null);
  await setCache(cache, info, urls);
  return parse(urls);
}
