import { onDocumentLoad } from "./functions.js";
import { initializeCache } from "./cache.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";

function main() {
    initializeCache();
    initializeHeader();
    initializeCarousels();
    initializeGenres();
    initializeAreas();
}

onDocumentLoad(main);