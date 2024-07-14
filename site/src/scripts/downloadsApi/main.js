import { downloadApi } from "../config.js";

export function getDownloadApiUrl() {
  return `${downloadApi.url}/${downloadApi.version}`;
}

export async function sendRequest(
  path,
  parameters = {},
  method = "GET",
  timeout = 10000,
) {
  const apiUrl = getDownloadApiUrl();
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
