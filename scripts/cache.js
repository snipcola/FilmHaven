import { config, store } from "./config.js";

let cache;

function imageExists(url) {
    return Array.from(cache.children).some((i) => i.src == url);
}

export function initializeCache() {
    cache = document.createElement("cache");
    document.body.append(cache);
}

export async function preloadImages(images, onAmount) {
    let count = 0;

    async function loadImage(url) {
        return new Promise(function (resolve) {
            function checkCount() {
                if (count >= (onAmount || images.length)) {
                    resolve();
                }
            }

            function incrementCount() {
                count++;
                resolve();
            }
            
            if (imageExists(url)) {
                incrementCount();
            } else {
                const image = new Image();

                image.addEventListener("load", incrementCount);
                image.addEventListener("error", incrementCount);

                image.src = url;
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

export function setCache(key, value) {
    localStorage.setItem(store.names.cache(key), JSON.stringify({ d: Date.now(), v: value }));
}

export function getCache(key, max = config.maxCacheDays) {
    const cache = localStorage.getItem(store.names.cache(key));

    if (cache) {
        let json;

        try { json = JSON.parse(cache) }
        catch { return };

        const diff = Date.now() - json.d;
        const daysDiff = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (daysDiff < max) {
            return json.v;
        }
    }

    return;
}