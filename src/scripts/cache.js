import { openDB } from "idb";
import { config, store, cachePrefix } from "./config.js";
import { blobToBase64 } from "./functions.js";

export function setCache(key, value) {
  if (![undefined, null].includes(value)) {
    localStorage.setItem(
      store.names.cache(key),
      JSON.stringify({ d: Date.now(), v: value }),
    );
  }
}

export function getCache(key, max = config.maxCacheDays) {
  const cache = localStorage.getItem(store.names.cache(key));

  if (cache) {
    let json;

    try {
      json = JSON.parse(cache);
    } catch {
      return;
    }

    const diff = Date.now() - json.d;
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff < max) {
      return json.v;
    }
  }

  return;
}

export function resetCache(exclusion) {
  const prefix = store.names.cache("");

  for (const key in localStorage) {
    if (
      key.startsWith(prefix) &&
      (!exclusion || key !== `${prefix}${exclusion}`)
    ) {
      localStorage.removeItem(key);
    }
  }
}

let fetching = new Map();
let db;

async function initializeDB() {
  if (!db) {
    db = await openDB(config.storePrefix, 1, {
      upgrade: (db) => db.createObjectStore(cachePrefix)
    });
  }
}

async function setDB(key, value) {
  await initializeDB();

  if (![undefined, null].includes(value)) {
    await db.put(
      cachePrefix,
      JSON.stringify({ d: Date.now(), v: value }),
      store.names.cache(key)
    );
  }
}

async function getDB(key, max = config.maxCacheDays) {
  await initializeDB();
  const result = await db.get(cachePrefix, store.names.cache(key));

  if (result) {
    let json;

    try {
      json = JSON.parse(result);
    } catch {
      return;
    }

    const diff = Date.now() - json.d;
    const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (daysDiff < max) {
      return json.v;
    }
  }

  return;
}

export async function resetDB() {
  await initializeDB();
  await db.clear(cachePrefix);
}

export async function cleanupDB(max = config.maxCacheDays) {
  await initializeDB();

  async function checkKey(key) {
    const result = await db.get(cachePrefix, key);

    if (result) {
      let json;

      try {
        json = JSON.parse(result);
      } catch {
        return;
      }

      const diff = Date.now() - json.d;
      const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

      if (daysDiff >= max) {
        await db.delete(cachePrefix, key);
      }
    }
  }

  const keys = await db.getAllKeys(cachePrefix);
  await Promise.all(keys.map(checkKey));
}

export async function cacheLoadImage(image, initial) {
  async function getURL() {
    if (!initial) return;

    const dbKey = `image-${btoa(initial)}`;
    const cachedResponse = await getDB(dbKey);

    if (cachedResponse) {
      return cachedResponse;
    }

    try {
      const response = await fetch(initial);

      if (response.status !== 200 || !response.headers.get("Content-Type")?.startsWith("image/")) {
        throw new Error();
      }

      const blob = await response.clone().blob();
      const dataURL = await blobToBase64(blob);

      await setDB(dbKey, dataURL);
      return dataURL;
    } catch {
      return initial;
    }
  }

  if (!fetching.get(initial)) {
    fetching.set(initial, getURL());
  }

  const url = await fetching.get(initial);

  if (fetching.get(initial)) {
    fetching.delete(initial);
  }

  if (image && url) {
    image.src = url;
  }
}

export async function cacheImages(images) {
  await Promise.all(images.map((url) => cacheLoadImage(null, url)));
}

let cache;

export function initializeCache() {
  cache = document.createElement("cache");
  document.body.append(cache);
}

export async function preloadImages(images) {
  let count = 0;

  function imageExists(url) {
    return Array.from(cache.children).some((i) => i.src === url);
  }

  async function loadImage(url) {
    return new Promise(function (resolve) {
      function checkCount() {
        if (count >= images.length) {
          resolve();
        }
      }

      function incrementCount() {
        count++;
        resolve();
      }

      if (imageExists(url) || url === undefined || url === null) {
        incrementCount();
      } else {
        const image = document.createElement("img");

        image.addEventListener("load", incrementCount);
        image.addEventListener("error", incrementCount);

        image.src = url;
        image.alt = `${config.storePrefix}-cache`;

        cache.append(image);
        checkCount();
      }
    });
  }

  await Promise.all(images.map(loadImage));
}

export function getNonCachedImages(images) {
  return images.filter(function (url) {
    const image = document.querySelector(`cache img[src="${url}"]`);
    return !image;
  });
}

export function unloadImages(images) {
  for (const url of images) {
    const image = document.querySelector(`cache img[src="${url}"]`);
    if (image) image.remove();
  }
}
