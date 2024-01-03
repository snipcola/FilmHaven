import { initializeTheme } from "./components/theme.js";
import { initializeCache } from "./cache.js";
import { initializeModal } from "./components/modal.js";
import { initializeContent } from "./components/content.js";
import { initializeHeader } from "./components/header.js";
import { initializeFooter } from "./components/footer.js";
import { initializeWatch } from "./components/watch.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeSearches } from "./components/search.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";
import { initializeSettings } from "./components/settings.js";
import { getSection } from "./store/sections.js";

let container;
let wrapper;
let content;

function enableBody() {
    document.body.classList.add("active");
}

function initializeBody() {
    container = document.createElement("div");
    wrapper = document.createElement("div");
    content = initializeContent(wrapper);

    container.className = "container";
    wrapper.className = "wrapper";
    
    container.append(wrapper);
    document.body.append(container);
}

function initializeAll() {
    initializeTheme();
    initializeCache();

    initializeModal();
    initializeBody();

    initializeHeader(wrapper, content);
    initializeFooter(container);
    initializeWatch();

    if (getSection("Carousel")) initializeCarousels();
    else content.classList.add("no-carousel");

    if (getSection("Search")) initializeSearches();
    if (getSection("Genres")) initializeGenres();
    initializeAreas();

    initializeSettings();
    enableBody();
}

initializeAll();