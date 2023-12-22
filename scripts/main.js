import { onDocumentLoad } from "./functions.js";
import { initializeHeader } from "./components/header.js";

function main() {
    initializeHeader();
}

onDocumentLoad(main);