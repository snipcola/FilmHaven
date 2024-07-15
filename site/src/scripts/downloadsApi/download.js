import { downloadApi } from "../config.js";
import { formatBytes } from "../functions.js";
import { sendRequest } from "./main.js";

function formatMovie(json) {
  const torrents = json?.data?.movie?.torrents;

  return torrents && Array.isArray(torrents) && torrents.length > 0
    ? torrents
        .filter((t) => t.hash && t.type && t.quality && t.size)
        .map(function (torrent) {
          return {
            hash: torrent.hash,
            type: torrent.type,
            quality: torrent.quality,
            size: torrent.size,
          };
        })
    : null;
}

function formatTV(json) {
  const torrents = json?.torrents;

  return torrents && Array.isArray(torrents) && torrents.length > 0
    ? torrents
        .filter(
          (t) => t.hash && t.title && t.size_bytes && t.season && t.episode,
        )
        .map(function (torrent) {
          return {
            hash: torrent.hash,
            title: torrent.title,
            size: formatBytes(torrent.size_bytes),
            season: torrent.season,
            episode: torrent.episode,
          };
        })
    : null;
}

export function getDownloads(type = "movie", imdbId) {
  return new Promise(async function (res) {
    if (type === "movie") {
      const response = await sendRequest("movie", "movie_details.json", {
        imdb_id: imdbId,
      });
      res(formatMovie(response));
    } else {
      let result = [];
      let page = 1;

      async function fetch() {
        const response = await sendRequest("tv", "get-torrents", {
          imdb_id: imdbId.replace(/[a-zA-Z]/g, ""),
          limit: downloadApi.tv.limit,
          page,
        });
        if (!response) res(result);

        const json = formatTV(response);
        if (json) result.push(...json);

        const totalTorrents = response?.torrents_count;
        const fetchedTorrents = page * downloadApi.tv.limit;
        page += 1;

        if (!totalTorrents || fetchedTorrents > totalTorrents) res(result);
        else fetch();
      }

      fetch();
    }
  });
}

export function constructMagnet(hash, name) {
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${downloadApi.trackers.map((t) => `&tr=${t}`).join("")}`;
}
