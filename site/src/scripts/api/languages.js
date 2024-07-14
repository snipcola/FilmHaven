import { sendRequest } from "./main.js";
import { setCache, getCache } from "../cache.js";
import { sortAlphabetically } from "./main.js";

function format(json) {
  let result = json
    ? json
        .filter((l) => l.english_name && l.iso_639_1 && l.iso_639_1 !== "xx")
        .map(function (language) {
          return {
            name: language.english_name,
            value: language.iso_639_1,
          };
        })
    : null;

  return sortAlphabetically(result, "name");
}

export async function getLanguages() {
  const cacheName = "languages";
  const cache = getCache(cacheName);

  if (cache) return cache;

  const response = await sendRequest("configuration/languages");
  const json = format(response);

  setCache(cacheName, json);
  return json;
}
