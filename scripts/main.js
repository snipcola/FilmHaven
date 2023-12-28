import { onDocumentLoad } from "./functions.js";
import { initializeCache } from "./cache.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";
import { initializeFooter } from "./components/footer.js";

initializeCache();

async function main() {
    const container = document.createElement("div");
    const wrapper = document.createElement("div");

    container.className = "container";
    wrapper.className = "wrapper";
    
    container.append(wrapper);
    document.body.append(container);

    initializeHeader(wrapper);
    
    await Promise.all([
        initializeCarousels(),
        initializeGenres(),
        initializeAreas()
    ]);

    initializeFooter(container);
}

onDocumentLoad(main);