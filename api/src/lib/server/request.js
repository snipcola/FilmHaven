import { providers } from "../../config.js";
import { check, get } from "../other/check.js";
import { setDashAudio } from "../other/embed.js";
import { notFound } from "./routes.js";

export async function onRequest(info, req) {
  const promises = providers.map(function (provider) {
    return new Promise(async function (res) {
      const response =
        provider[provider.type]?.constructor?.name === "AsyncFunction"
          ? await provider[provider.type](info.type, info, req)
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

export async function onPlayRequest(req, reply) {
  try {
    const { data, audio } = req.params;

    const url = decodeURIComponent(
      Buffer.from(data, "base64").toString("utf8"),
    );

    const response = await get(url);
    if (!response || response.status !== 200) throw Error;

    try {
      return setDashAudio(response.data, audio);
    } catch {
      throw Error;
    }
  } catch {
    notFound(reply);
  }
}
