import { config as embedConfig, getEmbedInfo } from "./lib/other/embed.js";

export const providers = [
  {
    base: embedConfig.base,
    online: true,
    type: "data",
    data: await getEmbedInfo,
  },
  {
    base: "vidsrc.pro",
    online: true,
    type: "url",
    url: function (type, { id, season, episode }) {
      if (type === "movie") return `https://${this.base}/embed/movie/${id}`;
      return `https://${this.base}/embed/tv/${id}/${season}/${episode}`;
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
  ],
};
