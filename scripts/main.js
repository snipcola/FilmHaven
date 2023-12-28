import { onDocumentLoad } from "./functions.js";
import { initializeCache } from "./cache.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeAreas } from "./components/area.js";

function main() {
    initializeCache();
    initializeHeader();
    initializeCarousels();
    initializeAreas();
}

onDocumentLoad(main);