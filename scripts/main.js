import { onDocumentLoad } from "./functions.js";
import { initializeHeader } from "./components/header.js";
import { initializeBigCards } from "./components/big-card.js";

function main() {
    initializeHeader();
    initializeBigCards();
}

onDocumentLoad(main);