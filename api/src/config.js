export const providers = [
  {
    base: "vidsrc.xyz",
    url: function (type, { id, season, episode }) {
      if (type === "movie") return `https://${this.base}/embed/movie/${id}`;
      return `https://${this.base}/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    base: "embed.su",
    url: function (type, { id, season, episode }) {
      if (type === "movie") return `https://${this.base}/embed/movie/${id}`;
      return `https://${this.base}/embed/tv/${id}/${season}/${episode}`;
    },
  },
  {
    base: "vidlink.pro",
    url: function (type, { id, season, episode }) {
      if (type === "movie")
        return `https://${this.base}/movie/${id}?autoplay=false`;
      return `https://${this.base}/tv/${id}/${season}/${episode}?autoplay=false`;
    },
  },
];

export const blacklist = {
  status: [404, 500],
  text: [
    "no sources",
    "no movie found",
    "no tv show found",
    "no episode found",
    "no show found",
    "you have been blocked", // cloudflare
    "__next_error__", // nextjs
    "media is unavailable", // vidsrc.xyz
  ],
};
