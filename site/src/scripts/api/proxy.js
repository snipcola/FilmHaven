import { isOnline } from "../functions.js";
import { getCustomProviders } from "../store/custom-providers.js";

const online = isOnline();

export async function getProviders(proxy, info, season, episode) {
  const customProviders = getCustomProviders();
  const custom =
    typeof customProviders !== "string" ? true : customProviders === "use";

  try {
    const data = btoa(
      encodeURIComponent(
        JSON.stringify({
          action: "providers",
          data: {
            type: info.type,
            id: info.id,
            imdbId: info.imdbId,
            season,
            episode,
            online,
            custom,
          },
        }),
      ),
    );
    const url = `${proxy}?data=${data}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(decodeURIComponent(atob(text)));

    return json.success ? json.providers : false;
  } catch (err) {
    return false;
  }
}
