import config from "../../config.js";
import fetch from "ky";

function promiseWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise(function (res) {
      setTimeout(res, (timeout || 5) * 1000);
    }),
  ]);
}

export async function get(url, base, json = false) {
  try {
    const headers = { Origin: `https://${base}`, Referer: `https://${base}/` };
    const response = await promiseWithTimeout(
      fetch.get(url, { headers }),
      process.env.TIMEOUT,
    );

    const status = response.status;
    const data = await response[json ? "json" : "text"]();

    return {
      status,
      data,
    };
  } catch {
    return null;
  }
}

export async function check(url, base) {
  const response = await get(url, base);
  const data =
    typeof response?.data === "string" ? response.data.toLowerCase() : "";

  switch (response) {
    case null:
      return false;
    default:
      const blacklistedStatus = config.blacklist.status.includes(
        response.status,
      );
      const blacklistedText = config.blacklist.text.some((t) =>
        data.includes(t),
      );

      return !(blacklistedStatus || blacklistedText);
  }
}
