import { fetchEmbedUrl } from "./lib/other/embed.js";

export default {
  providers: [
    ...[
      ...(process?.env?.NODE_ENV === "production"
        ? [
            {
              base: "fh.snipcola.com",
              online: true,
              custom: true,
              url: async function (...args) {
                return await fetchEmbedUrl(this.base, "https", ...args);
              },
            },
            {
              base: "film-haven.vercel.app",
              custom: true,
              url: async function (...args) {
                return await fetchEmbedUrl(this.base, "https", ...args);
              },
            },
          ]
        : [
            {
              base: "localhost:2000",
              custom: true,
              url: async function (...args) {
                return await fetchEmbedUrl(this.base, "http", ...args);
              },
            },
          ]),
    ],
    {
      base: "vidsrc.to",
      url: function (type, { id, season, episode }) {
        if (type === "movie") return `https://${this.base}/embed/movie/${id}`;
        return `https://${this.base}/embed/tv/${id}/${season}/${episode}`;
      },
    },
    {
      base: "vidsrc.pro",
      online: true,
      url: function (type, { id, season, episode }) {
        if (type === "movie") return `https://${this.base}/embed/movie/${id}`;
        return `https://${this.base}/embed/tv/${id}/${season}/${episode}`;
      },
    },
    {
      base: "moviesapi.club",
      online: true,
      url: function (type, { id, season, episode }) {
        if (type === "movie") return `https://${this.base}/movie/${id}`;
        return `https://${this.base}/tv/${id}-${season}-${episode}`;
      },
    },
  ],
  blacklist: {
    status: [
      404, // Not Found
      500, // Internal Server Error
    ],
    text: [
      "no sources",
      "no movie found",
      "no tv show found",
      "no episode found",
      "no show found",
      "eyJzdWNjZXNzIjpmYWxzZX0%3D", // Custom Embeds
    ],
  },
};
