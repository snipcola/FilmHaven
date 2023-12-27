export function preloadImages(images, callback) {
    let loaded = 0;
    
    for (const image of images) {
        const temp = new Image();
        temp.src = image;

        temp.onload = function () {
            loaded++;

            if (loaded == images.length && callback) {
                callback();
            }
        };
    }
}

export function onDocumentLoad(callback) {
    document.addEventListener("DOMContentLoaded", callback);
}