import { sendRequest } from "./main.js";

function format(json) {
  const torrents = json?.data?.movie?.torrents;

  return torrents && Array.isArray(torrents) && torrents.length > 0
    ? torrents
        .filter((t) => t.url && t.type && t.quality)
        .map(function (torrent) {
          return {
            url: torrent.url,
            type: torrent.type,
            quality: torrent.quality,
          };
        })
    : null;
}

export async function getDownloads(imdbId) {
  const response = await sendRequest("movie_details.json", { imdb_id: imdbId });
  return format(response);
}
