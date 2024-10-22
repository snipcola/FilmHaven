import { initializeArea } from "./area.js";
import {
  getContinueWatching,
  removeFromContinueWatching,
} from "../store/continue.js";
import { preloadImages } from "../cache.js";
import { isHovered } from "../functions.js";

export async function initializeContinue() {
  const label = "Continue";

  const homeSection = document.querySelector(".section.home");

  if (!homeSection) {
    return console.error("Failed to find home section.");
  }

  const homeContinueArea = document.createElement("div");
  homeContinueArea.className = "area continue inactive";
  homeSection.append(homeContinueArea);

  const control = document.createElement("div");
  const deleteButton = document.createElement("div");
  const deleteButtonIcon = document.createElement("i");

  control.className = "control continue";
  deleteButton.className = "button secondary icon-only previous";
  deleteButtonIcon.className = "icon icon-trash";

  deleteButton.append(deleteButtonIcon);
  control.append(deleteButton);

  let controlActive = false;
  let continueWatching = [];

  function checkControlActive() {
    const cards = Array.from(homeContinueArea.querySelectorAll(".card"));
    const continueControl = homeContinueArea.querySelector(
      ".control:not(.continue",
    );

    deleteButton.classList[controlActive ? "add" : "remove"]("active");
    if (continueControl) continueControl.onclick = checkControlActive;

    for (const card of cards) {
      const icon = card.querySelector(".play .icon");
      if (icon)
        icon.className = controlActive ? "icon icon-trash" : "icon icon-play";

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

  deleteButton.addEventListener("click", function () {
    controlActive = !controlActive;
    checkControlActive();
  });

  function initializeContinueWatching() {
    initializeArea(homeContinueArea, null, label);

    if (!continueWatching || continueWatching.length === 0) {
      homeContinueArea.classList.add("inactive");
      controlActive = false;
      control.remove();
    } else {
      preloadImages(continueWatching.map((i) => i.image));
      initializeArea(homeContinueArea, continueWatching, label);
      homeContinueArea.classList.remove("inactive");
      homeContinueArea.append(control);
    }

    checkControlActive();
  }

  async function check() {
    const newContinueWatching = getContinueWatching();
    const isMobile =
      navigator.maxTouchPoints || "ontouchstart" in document.documentElement;

    if (
      (continueWatching.length === 0 && newContinueWatching.length > 0) ||
      JSON.stringify(newContinueWatching) !== JSON.stringify(continueWatching)
    ) {
      continueWatching = newContinueWatching;
      initializeContinueWatching();
    }

    if (!isMobile && controlActive && !isHovered(homeContinueArea)) {
      controlActive = false;
      checkControlActive();
    }
  }

  await check();
  setInterval(check, 500);
}
