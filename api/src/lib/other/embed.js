import { get } from "./check.js";

export const config = {
  base: "api.insertunit.ws",
  url: "https://api.insertunit.ws",
};

export async function getEmbedInfo(type, info) {
  try {
    const path = `embed/imdb/${info.imdbId}`;
    const response = await get(`${config.url}/${path}`, config.base);
    if (!response || response.status !== 200) return null;

    let _sources = [];
    let _subtitles = [];

    if (type === "movie") {
      // Sources
      const url = /hls:\s"(.+?)"/.exec(response.data)[1];
      let quality = 1080;

      try {
        quality = Math.max(
          ...Object.values(
            JSON.parse(/qualityByWidth:\s+({.*\})/.exec(response.data)[1]),
          ),
        );
      } catch {}

      if (!url || !quality) {
        return null;
      }

      _sources.push({ url, quality });

      // Subtitles
      try {
        const subtitles = JSON.parse(
          /cc:\s+(\[{.*\}\])/.exec(response.data)[1],
        );

        for (const subtitle of subtitles) {
          if (subtitle.url && subtitle.name)
            _subtitles.push({ url: subtitle.url, lang: subtitle.name });
        }
      } catch {}
    } else {
      // Season
      const seasons = JSON.parse(/seasons:(\[{.*\}\])/.exec(response.data)[1]);
      const episodes = seasons.find(
        (s) => !s.blocked && s.season.toString() === info.season.toString(),
      ).episodes;
      const episode = episodes.find(
        (e) => e.episode.toString() === info.episode.toString(),
      );

      // Sources
      const url = episode.hls;
      let quality = 1080;

      try {
        quality = Math.max(...Object.values(episode.qbw));
      } catch {}

      if (!url || !quality) {
        return null;
      }

      _sources.push({ url, quality });

      // Subtitles
      try {
        for (const subtitle of episode.cc) {
          if (subtitle.url && subtitle.name)
            _subtitles.push({ url: subtitle.url, lang: subtitle.name });
        }
      } catch {}
    }

    const sources = _sources
      .filter(
        (s) =>
          typeof s?.url === "string" && s?.url?.endsWith(".m3u8") && s?.quality,
      )
      .map(({ url, quality }) => ({ url, quality }));
    const subtitles = _subtitles
      .filter(
        (s) =>
          typeof s?.url === "string" && s?.url?.endsWith(".vtt") && s?.lang,
      )
      .map(({ url, lang }) => ({ url, language: lang }));

    return sources.length > 0 ? { sources, subtitles } : null;
  } catch {
    return null;
  }
}

export async function fetchEmbedUrl(base, protocol, ...args) {
  const embedInfo = await getEmbedInfo(...args);
  if (!embedInfo) return null;

  const data = btoa(
    encodeURIComponent(JSON.stringify({ action: "embed", data: embedInfo })),
  );
  return `${protocol}://${base}/api?data=${data}`;
}
