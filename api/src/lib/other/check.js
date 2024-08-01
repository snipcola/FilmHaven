import { blacklist } from "../../config.js";
import fetch from "node-fetch-native";

function promiseWithTimeout(promise, timeout) {
  return Promise.race([
    promise,
    new Promise(function (res) {
      setTimeout(res, (timeout || 8) * 1000);
    }),
  ]);
}

export async function get(url, base, json = false) {
  try {
    const headers = { Origin: `https://${base}`, Referer: `https://${base}/` };
    const response = await promiseWithTimeout(
      fetch(url, { headers }),
      typeof process !== "undefined" ? process.env.TIMEOUT : null,
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
      const blacklistedStatus = blacklist.status.includes(response.status);
      const blacklistedText = blacklist.text.some((t) => data.includes(t));

      return !(blacklistedStatus || blacklistedText);
  }
}
