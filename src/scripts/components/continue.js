import { config } from "../config.js";
import { initializeArea } from "./area.js";
import { getContinueWatching } from "../store/continue.js";
import { preloadImages } from "../cache.js";

export async function initializeContinue() {
    const desktop = window.innerWidth > config.area.split.max;
    const label = "Continue";

    const homeSection = document.querySelector(".section.home");

    if (!homeSection) {
        return console.error("Failed to find sections.");
    }

    const homeContinueArea = document.createElement("div");
    homeContinueArea.className = "area inactive";
    homeSection.append(homeContinueArea);

    let continueWatching = [];

    async function initializeContinueWatching() {
        initializeArea(homeContinueArea, null, label);

        if (!continueWatching || continueWatching.length === 0) {
            homeContinueArea.classList.add("inactive");
        } else {
            await preloadImages(continueWatching.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);    
            initializeArea(homeContinueArea, continueWatching, label);
            homeContinueArea.classList.remove("inactive");
        }
    }

    async function check() {
        const newContinueWatching = getContinueWatching();

        if (continueWatching.length === 0 && newContinueWatching.length > 0 || JSON.stringify(newContinueWatching) !== JSON.stringify(continueWatching)) {
            continueWatching = newContinueWatching;
            await initializeContinueWatching();
        }
    }

    await check();
    setInterval(check, 500);
}