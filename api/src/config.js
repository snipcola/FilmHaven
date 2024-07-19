export default {
  providers: [
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
      "not found",
      "no sources",
      "no movie found",
      "no tv show found",
      "no episode found",
      "no show found",
    ],
  },
};
