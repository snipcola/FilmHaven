export function onDocumentLoad(callback) {
    document.addEventListener("DOMContentLoaded", callback);
}

export function getInnerText(element) {
    return element?.textContent?.match(/[A-Za-z]+/g)?.join("");
}

export function isHovered(element) {
    return element.matches(":hover");
}