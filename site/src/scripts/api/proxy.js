import { isOnline } from "../functions.js";
import { getCustomProviders } from "../store/custom-providers.js";

const online = isOnline();

export async function getProviders(proxy, info, season, episode) {
  const customProviders = getCustomProviders();
  const custom =
    typeof customProviders !== "string" ? true : customProviders === "use";

  try {
    const url =
      info.type === "movie"
        ? `${proxy}/${info.id}/${info.imdbId}/${online}/${custom}`
        : `${proxy}/${info.id}/${info.imdbId}/${season}/${episode}/${online}/${custom}`;

    const response = await fetch(url);
    const json = await response.json();

    return json.success ? json.providers : false;
  } catch {
    return false;
  }
}
