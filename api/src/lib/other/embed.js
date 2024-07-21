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

    let dashUrl = "";
    let hlsUrl = "";
    let audio = { names: [], order: [] };
    let subtitles = [];
    let qualities = { 1920: 1080 };

    if (type === "movie") {
      // URL
      dashUrl = /dash:\s"(.+?)"/.exec(response.data)[1];
      hlsUrl = /hls:\s"(.+?)"/.exec(response.data)[1];

      // Audio
      try {
        audio = JSON.parse(/audio:\s+({.*\})/.exec(response.data)[1]);
      } catch {}

      // Subtitles
      try {
        subtitles = JSON.parse(/cc:\s+(\[{.*\}\])/.exec(response.data)[1]);
      } catch {}

      // Qualities
      try {
        qualities = JSON.parse(
          /qualityByWidth:\s+({.*\})/.exec(response.data)[1],
        );
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

      // URL
      dashUrl = episode.dash;
      hlsUrl = episode.hls;

      // Audio
      audio = episode.audio;

      // Subtitles
      subtitles = episode.cc;

      // Qualities
      try {
        qualities = JSON.parse(
          /qualityByWidth:\s+({.*\})/.exec(response.data)[1],
        );
      } catch {}
    }

    // Checks
    if (
      !dashUrl ||
      typeof dashUrl !== "string" ||
      !dashUrl.endsWith(".mpd") ||
      !hlsUrl ||
      typeof hlsUrl !== "string" ||
      !hlsUrl.endsWith(".m3u8")
    ) {
      return null;
    }

    if (
      !audio ||
      typeof audio !== "object" ||
      !audio.names ||
      !Array.isArray(audio.names) ||
      !audio.order ||
      !Array.isArray(audio.order)
    ) {
      audio = { names: [], order: [] };
    }

    subtitles = subtitles.filter(function (subtitle) {
      return (
        subtitle.url &&
        typeof subtitle.url === "string" &&
        subtitle.url.endsWith(".vtt") &&
        subtitle.name &&
        typeof subtitle.name === "string"
      );
    });

    if (
      !qualities ||
      typeof qualities !== "object" ||
      Object.values(qualities).length === 0
    ) {
      qualities = { 1920: 1080 };
    }

    // Return
    return { dashUrl, hlsUrl, audio, subtitles, qualities };
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
