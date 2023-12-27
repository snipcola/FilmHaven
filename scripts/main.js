import { onDocumentLoad } from "./functions.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";

function main() {
    initializeHeader();
    initializeCarousels();
}

onDocumentLoad(main);