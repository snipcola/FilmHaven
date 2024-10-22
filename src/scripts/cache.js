import { config, store } from "./config.js";

let cache;
let cachedImages = [];

function imageExists(url) {
  return Array.from(cache.children).some((i) => i.src === url);
}

export function initializeCache() {
  cache = document.createElement("cache");
  document.body.append(cache);
}

export function isDeletable(image) {
  return !cachedImages.includes(image);
}

export async function preloadImages(images, save) {
  if (save) {
    const uniqueImages = new Set([...cachedImages, ...images]);
    cachedImages = [...uniqueImages];
  }

  let count = 0;

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
        image.alt = "cache";

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

export function unloadImages(images, clean) {
  if (clean) cachedImages = cachedImages.filter((u) => !images.includes(u));

  for (const url of images) {
    const image = document.querySelector(`cache img[src="${url}"]`);
    if (image) image.remove();
  }
}

export function setCache(key, value) {
  localStorage.setItem(
    store.names.cache(key),
    JSON.stringify({ d: Date.now(), v: value }),
  );
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
