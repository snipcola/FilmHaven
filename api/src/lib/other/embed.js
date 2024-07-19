export const config = {
  url: "https://cg.autoembed.cc/api",
};

export async function sendRequest(
  path,
  parameters = {},
  method = "GET",
  timeout = 20000,
) {
  const apiUrl = config.url;
  const url = new URL(`${apiUrl}/${path}`);

  Object.entries(parameters).forEach(([key, value]) => {
    url.searchParams.append(key, value);
  });

  let response;

  try {
    response = await fetch(url, {
      method,
      timeout,
      headers: { accept: "application/json" },
    });
  } catch {
    return;
  }

  if (response.status !== 200) return;

  let json;

  try {
    json = await response.json();
  } catch {
    return;
  }

  return json;
}

export async function getEmbedInfo(type, info) {
  try {
    const path =
      type === "movie"
        ? `cinego/movie/UpCloud/${info.id}`
        : `cinego/tv/UpCloud/${info.id}/${info.season}/${info.episode}`;
    const response = await sendRequest(path);
    const sources = (response?.sources || [])
      .filter(
        (s) =>
          typeof s?.url === "string" && s?.url?.endsWith(".m3u8") && s?.quality,
      )
      .map(({ url, quality }) => ({ url, quality }));
    const subtitles = (response?.subtitles || [])
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
