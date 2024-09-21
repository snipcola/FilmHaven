export async function getProviders(proxy, info, season, episode, agent) {
  try {
    const url =
      info.type === "movie"
        ? `${proxy}/${info.id}/${info.imdbId}/${agent}`
        : `${proxy}/${info.id}/${info.imdbId}/${season}/${episode}/${agent}`;

    const response = await fetch(url);
    const json = await response.json();

    return json.success ? json.providers : false;
  } catch {
    return false;
  }
}
