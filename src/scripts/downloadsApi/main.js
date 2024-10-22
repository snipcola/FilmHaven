import { downloadApi } from "../config.js";

export function getDownloadMoviesApiUrl() {
  return `${downloadApi.movies.url}/${downloadApi.movies.version}`;
}

export function getDownloadTVApiUrl() {
  return downloadApi.tv.url;
}

export async function sendRequest(
  type = "movie",
  path,
  parameters = {},
  method = "GET",
  timeout = 10000,
) {
  const apiUrl =
    type === "movie" ? getDownloadMoviesApiUrl() : getDownloadTVApiUrl();
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
