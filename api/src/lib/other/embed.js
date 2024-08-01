import { get } from "./check.js";

export const config = {
  base: "api.insertunit.ws",
  url: "https://api.insertunit.ws",
};

export async function getEmbedInfo(type, info) {
  try {
    const path = `embed/imdb/${info.imdbId}`;
    const response = await get(`${config.url}/${path}`, config.base, false);
    if (!response || response.status !== 200) return null;

    let dash = "";
    let hls = "";
    let audio = { names: [], order: [] };
    let subtitles = [];
    let qualities = { 1920: 1080 };

    if (type === "movie") {
      dash = /dash:\s"(.+?)"/.exec(response.data)[1];
      hls = /hls:\s"(.+?)"/.exec(response.data)[1];

      try {
        audio = JSON.parse(/audio:\s+({.*\})/.exec(response.data)[1]);
      } catch {}

      try {
        subtitles = JSON.parse(/cc:\s+(\[{.*\}\])/.exec(response.data)[1]);
      } catch {}

      try {
        qualities = JSON.parse(
          /qualityByWidth:\s+({.*\})/.exec(response.data)[1],
        );
      } catch {}
    } else {
      const seasons = JSON.parse(/seasons:(\[{.*\}\])/.exec(response.data)[1]);
      const episodes = seasons.find(
        (s) => !s.blocked && s.season.toString() === info.season.toString(),
      ).episodes;
      const episode = episodes.find(
        (e) => e.episode.toString() === info.episode.toString(),
      );

      dash = episode.dash;
      hls = episode.hls;
      audio = episode.audio;
      subtitles = episode.cc;

      try {
        qualities = JSON.parse(
          /qualityByWidth:\s+({.*\})/.exec(response.data)[1],
        );
      } catch {}
    }

    if (
      (!dash || typeof dash !== "string" || !dash.endsWith(".mpd")) &&
      (!hls || typeof hls !== "string" || !hls.endsWith(".m3u8"))
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

    return { dash, hls, audio, subtitles, qualities };
  } catch {
    return null;
  }
}
