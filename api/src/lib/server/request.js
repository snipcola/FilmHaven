import { providers } from "../../config.js";
import { check } from "../other/check.js";

export async function onRequest(info) {
  const promises = providers.map(function (provider) {
    return new Promise(async function (res) {
      const response =
        provider[provider.type]?.constructor?.name === "AsyncFunction"
          ? await provider[provider.type](info.type, info)
          : provider[provider.type](info.type, info);
          
      const valid =
        response &&
        (provider.type === "data" || (await check(response, provider.base)));

      res(
        valid
          ? {
              name: provider.base,
              online: provider.online || false,
              type: provider.type,
              [provider.type]: response,
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
