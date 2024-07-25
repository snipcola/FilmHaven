import { isOnline } from "../functions.js";

const online = isOnline();

export async function getProviders(proxy, info, season, episode) {
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
          },
        }),
      ),
    );
    const url = `${proxy}?data=${data}`;
    const response = await fetch(url);
    const text = await response.text();
    const json = JSON.parse(decodeURIComponent(atob(text)));

    return json.success ? json.providers : false;
  } catch {
    return false;
  }
}
