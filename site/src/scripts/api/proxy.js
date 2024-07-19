import { isOnline } from "../functions.js";

const online = isOnline();

export async function getProviders(proxy, info, season, episode) {
  try {
    const url =
      info.type === "movie"
        ? `${proxy}/${info.id}/${info.imdbId}/${online}`
        : `${proxy}/${info.id}/${info.imdbId}/${season}/${episode}/${online}`;

    const response = await fetch(url);
    const json = await response.json();

    return json.success ? json.providers : false;
  } catch {
    return false;
  }
}
