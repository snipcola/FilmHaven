export async function getProviders(proxy, info, season, episode) {
  try {
    const url =
      info.type === "movie"
        ? `${proxy}/${info.id}/${info.imdbId}`
        : `${proxy}/${info.id}/${info.imdbId}/${season}/${episode}`;

    const response = await fetch(url);
    const json = await response.json();

    return json.success ? json.providers : false;
  } catch {
    return false;
  }
}
