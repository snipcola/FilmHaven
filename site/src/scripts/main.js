import { config } from "./config.js";
import { initializeTheme } from "./components/theme.js";
import { initializeCache } from "./cache.js";
import { initializeDim } from "./components/dim.js";
import { initializeModal } from "./components/modal.js";
import { initializeContent } from "./components/content.js";
import { initializeHeader } from "./components/header.js";
import { initializeFooter } from "./components/footer.js";
import { initializeWatch } from "./components/watch.js";
import { initializeCarousels } from "./components/carousel.js";
import { initializeSearches } from "./components/search.js";
import { initializeContinue } from "./components/continue.js";
import { initializeGenres } from "./components/genres.js";
import { initializeAreas } from "./components/area.js";
import { initializeSettings } from "./components/settings.js";

import { getPage } from "./store/pages.js";
import { getSection } from "./store/sections.js";

let container;
let contentContainer;
let content;

function enableBody() {
  document.body.classList.add("active");
}

function initializeBody() {
  container = document.createElement("div");
  contentContainer = document.createElement("div");
  content = initializeContent(contentContainer);

  container.className = "container";
  contentContainer.className = "content-container";

  container.append(contentContainer);
  document.body.append(container);
}

function initializeAll() {
  initializeTheme();
  initializeCache();

  initializeDim();
  initializeModal();
  initializeBody();

  initializeHeader(container, content);
  initializeFooter(container);
  initializeWatch();

  if (getPage("Home") && getSection("Search")) initializeSearches();
  if (getPage("Home") && getSection("Continue")) initializeContinue();

  if (getSection("Carousel")) initializeCarousels();
  else content.classList.add("no-carousel");
  if (getSection("Genres")) initializeGenres();
  initializeAreas();

  initializeSettings();
  enableBody();

  if (window?.location?.origin)
    console.log(`[${config.name}] Running at ${window.location.origin}`);
}

initializeAll();
