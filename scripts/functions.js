export function onDocumentLoad(callback) {
    document.addEventListener("DOMContentLoaded", callback);
}

export function getInnerText(element) {
    return element?.textContent?.toLowerCase()?.match(/[a-z]+/g)?.join("");
}