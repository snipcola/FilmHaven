import { initializeCache } from "./cache.js";
import { initializeHeader } from "./components/header.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";
import { initializeFooter } from "./components/footer.js";

let container;
let wrapper;

function initializeBody() {
    container = document.createElement("div");
    wrapper = document.createElement("div");

    container.className = "container";
    wrapper.className = "wrapper";
    
    container.append(wrapper);
    document.body.append(container);
}

function initializeAll() {
    initializeCache();
    initializeBody();

    initializeHeader(wrapper);
    initializeFooter(container);

    initializeCarousels();
    initializeGenres();
    initializeAreas();
}

initializeAll();