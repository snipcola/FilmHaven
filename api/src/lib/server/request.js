import config from "../../config.js";
import { check } from "../other/check.js";
import { getEmbedInfo } from "../other/embed.js";

export async function onRequest(type, req) {
  // Parameters
  const id = req.params.id;
  const imdbId = req.params.imdbId;
  const season = req.params.season;
  const episode = req.params.episode;
  const online = req.params.online;
  const info = { id, imdbId, season, episode };

  // Empty Check
  if (id === "" || imdbId === "" || season === "" || episode === "") {
    return { success: false, message: "Missing parameters" };
  }

  // Get Providers
  const promises = config.providers
    .filter((provider) =>
      typeof online !== "string"
        ? true
        : online === "true"
          ? true
          : provider.online !== true,
    )
    .map(function (provider) {
      return new Promise(async function (res) {
        const url = provider.url(type, info);
        const valid = await check(url, provider.base);

        res(valid ? { provider: provider.base, url } : null);
      });
    });
  const providers = (await Promise.all(promises)).filter((p) => p !== null);

  // Return
  return { success: true, providers };
}

export async function onEmbedRequest(type, req, reply) {
  // Parameters
  const id = req.params.id;
  const season = req.params.season;
  const episode = req.params.episode;
  const info = { id, season, episode };

  // Empty Check
  if (id === "" || season === "" || episode === "") {
    return { success: false, message: "Missing parameters" };
  }

  // Get Embed Info
  const embedInfo = await getEmbedInfo(type, info);
  if (!embedInfo) return { success: false, message: "No sources" };

  // Return Embed
  reply.type("text/html");
  return `<!DOCTYPE html>
<html>
  <head>
    <title>${type === "movie" ? `${info.id}` : `${info.id} (S${season} E${episode})`}</title>
    <meta name="description" content="A catalog of thousands of movies & shows.">
    <meta charset="UTF-8">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi">
    <style>
      body {
        margin: 0 !important;
        background-color: black !important;
        width: 100dvw !important;
        height: 100dvh !important;
        overflow: hidden !important;
      }
    </style>
    <script src="https://cdn.fluidplayer.com/v3/current/fluidplayer.min.js"></script>
  </head>
  <body>
    <video id="player" controls playsinline>
${embedInfo.sources.map((s) => `<source src="${s.url}" title="${s.quality === "auto" ? s.quality : `${s.quality}p`}" type="application/x-mpegURL" />`).join(`\n       `)}
${embedInfo.subtitles.map((c) => `<track src="${c.url}" label="${c.language}" srclang="${c.language}" kind="metadata">`).join(`\n       `)}
    </video>
    <script>
      new fluidPlayer("player", {
        layoutControls: {
          primaryColor: "#e12323",
          playButtonShowing: false,
          fillToContainer: true,
          subtitlesEnabled: true,
          subtitlesOnByDefault: false,
          keyboardControl: true,
          controlBar: {
            autoHide: true,
            autoHideTimeout: 3,
            animated: true,
          },
          allowTheatre: false,
          controlForwardBackward: {
            show: true,
          },
          contextMenu: {
            controls: true,
          },
          miniPlayer: {
            enabled: false,
          },
        },
        onBeforeXMLHttpRequest: (req) => {
          req.withCredentials = false;
        }
      });
    </script>
  </body>
</html>`;
}
