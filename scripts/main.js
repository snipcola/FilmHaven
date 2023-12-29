import { initializeCache } from "./cache.js";
import { initializeModal } from "./components/modal.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeSearches } from "./components/search.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";
import { initializeFooter } from "./components/footer.js";

let container;
let wrapper;

function enableBody() {
    document.body.classList.add("active");
}

function initializeBody() {
    container = document.createElement("div");
    wrapper = document.createElement("div");

    container.className = "container";
    wrapper.className = "wrapper";
    
    container.append(wrapper);
    document.body.append(container);
}

async function initializeAll() {
    initializeCache();
    initializeModal();
    initializeBody();

    initializeHeader(wrapper);
    initializeFooter(container);
    enableBody();

    await initializeCarousels();
    initializeSearches();
    await initializeGenres();
    await initializeAreas();
}

initializeAll();