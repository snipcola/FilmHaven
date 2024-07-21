import { providers as _providers } from "../../config.js";
import { check } from "../other/check.js";

export async function onRequest(req, reply) {
  // Parameters
  const data = req.query.data;

  // Empty Check
  if (data === "") {
    return btoa(encodeURIComponent(JSON.stringify({ success: false })));
  }

  // Parse Data
  let action;
  let info;

  try {
    const result = JSON.parse(decodeURIComponent(atob(data)));

    if (
      !result ||
      typeof result.action !== "string" ||
      typeof result.data !== "object" ||
      !["providers", "embed"].includes(result.action)
    ) {
      return btoa(encodeURIComponent(JSON.stringify({ success: false })));
    }

    action = result.action;
    info = result.data;
  } catch {
    return btoa(encodeURIComponent(JSON.stringify({ success: false })));
  }

  // Check Action
  if (action === "providers") {
    if (
      !info ||
      typeof info.type !== "string" ||
      typeof info.id !== "string" ||
      typeof info.imdbId !== "string" ||
      (info.type !== "movie" &&
        (typeof info.season !== "number" || typeof info.episode !== "number"))
    ) {
      return btoa(encodeURIComponent(JSON.stringify({ success: false })));
    }

    // Get Providers
    const promises = _providers
      .filter(
        (provider) =>
          typeof info.online !== "boolean" ||
          info.online === true ||
          provider.online !== true,
      )
      .map(function (provider) {
        return new Promise(async function (res) {
          const url =
            provider.url?.constructor?.name === "AsyncFunction"
              ? await provider.url(info.type, info)
              : provider.url(info.type, info);
          const valid = url && (await check(url, provider.base));

          res(valid ? { provider: provider.base, url } : null);
        });
      });
    const providers = (await Promise.all(promises)).filter((p) => p !== null);

    // Return
    return btoa(
      encodeURIComponent(JSON.stringify({ success: true, providers })),
    );
  } else {
    if (
      !info ||
      !info.dashUrl ||
      !info.hlsUrl ||
      !info.audio ||
      !info.subtitles ||
      !info.qualities
    ) {
      return btoa(encodeURIComponent(JSON.stringify({ success: false })));
    }

    // Return Embed
    reply.type("text/html");
    return `<!DOCTYPE html>
<html>
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="user-scalable=no, initial-scale=1, maximum-scale=1, minimum-scale=1, width=device-width, height=device-height, target-densitydpi=device-dpi">
    <style>
      body {
        background-color: black !important;
        margin: 0 !important;
        width: 100dvw !important;
        height: 100dvh !important;
        overflow: hidden !important;
      }
    </style>
    <script src="https://cdn.jsdelivr.net/npm/venom-player@0.2.88"></script>
  </head>
  <body>
    <script>
      const dash = "${info.dashUrl}";
      const hls = "${info.hlsUrl}";
      const audio = ${JSON.stringify(info.audio)};
      const subtitles = ${JSON.stringify(info.subtitles)};
      const qualities = ${JSON.stringify(info.qualities)};

      localStorage.setItem("player.cc", "Off");
      localStorage.setItem("player.isCountdown", false);
      localStorage.setItem("player.muted", false);
      localStorage.setItem("player.speed", "1");
      localStorage.setItem("player.withTotal", true);

      const englishAudio = (audio.names || [])
        .find(function (_name) {
          const name = _name.toLowerCase();
          return (name.startsWith("eng") || name.includes("original")) && !name.includes("commentary");
        });
      if (englishAudio) {
        localStorage.setItem("player.track", englishAudio);
      }

      const highestQuality = Math.max(...Object.values(qualities || []));
      if (highestQuality) {
        localStorage.setItem("player.quality", highestQuality);
      }

      VenomPlayer.make({
        publicPath: \`https://cdn.jsdelivr.net/npm/venom-player@\${VenomPlayer.version}/dist/\`,
        source: {
          dash,
          hls,
          audio,
          cc: subtitles,
        },
        hlsNativeQuality: false,
        qualityByWidth: qualities,
        ui: {
          autoLandscape: true,
          pip: true,
          theme: "modern",
          share: false,
          timeline: true,
          prevNext: true,
        },
        cssVars: {
          "color-primary": "#e12323",
          "background-color-primary": "rgba(26, 26, 26, 0.75)",
        },
        speed: [0.25, 0.5, 0.75, 1, 1.25, 1.5, 1.75, 2],
        trackProgress: 30,
        replay: false,
      });
    </script>
  </body>
</html>`
      .replace(/\>[\r\n ]+\</g, "><")
      .replace(/(<.*?>)|\s+/g, (_, $1) => ($1 ? $1 : " "))
      .trim();
  }
}
