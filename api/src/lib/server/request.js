import { providers } from "../../config.js";
import { check } from "../other/check.js";

export async function onRequest(info, req) {
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

  return {
    success: true,
    providers: (await Promise.all(promises)).filter((p) => p !== null),
  };
}
