let cache;

function imageExists(url) {
    return Array.from(cache.children).some((i) => i.src == url);
}

export function initializeCache() {
    cache = document.createElement("cache");
    document.body.appendChild(cache);
}

export function preloadImages(images) {    
    for (const url of images) {
        if (imageExists(url)) {
            continue;
        }

        const image = new Image();
        
        image.src = url;
        cache.append(image);
    }
}