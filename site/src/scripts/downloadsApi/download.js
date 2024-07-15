import { downloadApi } from "../config.js";
import { sendRequest } from "./main.js";

function format(json) {
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

export async function getDownloads(imdbId) {
  const response = await sendRequest("movie_details.json", { imdb_id: imdbId });
  return format(response);
}

export function constructMagnet(hash, name) {
  return `magnet:?xt=urn:btih:${hash}&dn=${encodeURIComponent(name)}${downloadApi.trackers.map((t) => `&tr=${t}`).join("")}`;
}