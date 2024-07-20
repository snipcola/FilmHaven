import { get } from "./check.js";

export const config = {
  base: "autoembed.cc",
  url: "https://cg.autoembed.cc/api",
};

export async function getEmbedInfo(type, info) {
  try {
    const path =
      type === "movie"
        ? `cinego/movie/UpCloud/${info.id}`
        : `cinego/tv/UpCloud/${info.id}/${info.season}/${info.episode}`;
    const response = await get(`${config.url}/${path}`, config.base, true);
    if (response.status !== 200) return null;
    
    const sources = (response?.data?.sources || [])
      .filter(
        (s) =>
          typeof s?.url === "string" && s?.url?.endsWith(".m3u8") && s?.quality,
      )
      .map(({ url, quality }) => ({ url, quality }));
    const subtitles = (response?.data?.subtitles || [])
      .filter(
        (s) =>
          typeof s?.url === "string" && s?.url?.endsWith(".vtt") && s?.lang,
      )
      .map(({ url, lang }) => ({ url, language: lang }));

    return sources.length > 0 ? { sources, subtitles } : null;
  } catch {
    return null;
  }
}

export async function fetchEmbedUrl(base, protocol, ...args) {
  const embedInfo = await getEmbedInfo(...args);
  if (!embedInfo) return null;

  const data = btoa(
    encodeURIComponent(JSON.stringify({ action: "embed", data: embedInfo })),
  );
  return `${protocol}://${base}/api?data=${data}`;
}
