import { isLocal } from "../functions.js";

const local = isLocal();

export async function isValidProxy(proxy) {
  try {
    const response = await fetch(proxy);
    const json = await response.json();
    const providers =
      json.success &&
      json.providers
        .filter((provider) => (local ? provider.local : true))
        .map((provider) => provider.base);

    return providers || false;
  } catch {
    return false;
  }
}

export async function isValidUrl(proxy, provider, info, season, episode) {
  try {
    const url =
      info.type === "movie"
        ? `${proxy}/${provider}/${info.id}/${info.imdbId}`
        : `${proxy}/${provider}/${info.id}/${season}/${episode}/${info.imdbId}`;

    const response = await fetch(url);
    const json = await response.json();

    return json.success ? json.url : false;
  } catch {
    return false;
  }
}
