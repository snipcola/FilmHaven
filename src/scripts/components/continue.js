import { config } from "../config.js";
import { initializeArea } from "./area.js";
import { getContinueWatching, removeFromContinueWatching } from "../store/continue.js";
import { preloadImages } from "../cache.js";
import { isHovered } from "../functions.js";

export async function initializeContinue() {
    const desktop = window.innerWidth > config.area.split.max;
    const label = "Continue";

    const homeSection = document.querySelector(".section.home");

    if (!homeSection) {
        return console.error("Failed to find home section.");
    }

    const homeContinueArea = document.createElement("div");
    homeContinueArea.className = "area continue inactive";
    homeSection.append(homeContinueArea);

    const control = document.createElement("div");
    const controlButton = document.createElement("div");
    const controlButtonIcon = document.createElement("i");

    control.className = "control continue";
    controlButton.className = "button secondary icon-only previous";
    controlButtonIcon.className = "icon icon-trash";

    controlButton.append(controlButtonIcon);
    control.append(controlButton);

    let controlActive = false;
    let continueWatching = [];

    function checkCards() {
        const continueControl = homeContinueArea.querySelector(".control:not(.continue");
        if (continueControl) continueControl.onclick = checkCards;
        
        const cards = Array.from(homeContinueArea.querySelectorAll(".card"));

        for (const card of cards) {
            const icon = card.querySelector(".play .icon");
            if (icon) icon.className = controlActive ? "icon icon-trash" : "icon icon-play";

            card.classList[controlActive ? "add" : "remove"]("disabled");
            card.onclick = function () {
                const id = card.getAttribute("data-id");
                const type = card.getAttribute("data-type");

                if (controlActive && id && type) {
                    removeFromContinueWatching(id, type);
                    card.remove();
                    check();
                }
            };
        }
    }

    controlButton.addEventListener("click", function () {
        controlActive = !controlActive;
        controlButton.classList[controlActive ? "add" : "remove"]("active");
        checkCards();
    });

    async function initializeContinueWatching() {
        initializeArea(homeContinueArea, null, label);

        if (!continueWatching || continueWatching.length === 0) {
            homeContinueArea.classList.add("inactive");
            control.remove();
        } else {
            await preloadImages(continueWatching.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);    
            initializeArea(homeContinueArea, continueWatching, label);
            homeContinueArea.classList.remove("inactive");

            homeContinueArea.append(control);
            checkCards();
        }
    }

    async function check() {
        const newContinueWatching = getContinueWatching();

        if (continueWatching.length === 0 && newContinueWatching.length > 0 || JSON.stringify(newContinueWatching) !== JSON.stringify(continueWatching)) {
            continueWatching = newContinueWatching;
            await initializeContinueWatching();
        }

        if (controlActive && !isHovered(homeContinueArea)) {
            controlActive = false;
            controlButton.classList[controlActive ? "add" : "remove"]("active");
            checkCards();
        }
    }

    await check();
    setInterval(check, 500);
}