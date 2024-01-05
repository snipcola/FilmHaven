import { config } from "../config.js";
import { initializeArea } from "./area.js";
import { getContinueWatching } from "../store/continue.js";

export function initializeContinue() {
    const desktop = window.innerWidth > config.area.split.max;
    const label = "Continue";

    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to find sections.");
    }

    const moviesContinueArea = document.createElement("div");
    const showsContinueArea = document.createElement("div");

    moviesContinueArea.className = "area inactive";
    showsContinueArea.className = "area inactive";

    moviesSection.append(moviesContinueArea);
    showsSection.append(showsContinueArea);

    let continueMovies = [];
    let continueShows = [];

    async function initializeMovies() {
        initializeArea(moviesContinueArea, null, label);

        if (!continueMovies || continueMovies.length === 0) {
            moviesContinueArea.classList.add("inactive");
        } else {
            await preloadImages(continueMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);    
            initializeArea(moviesContinueArea, continueMovies, label);
            moviesContinueArea.classList.remove("inactive");
        }
    }

    async function initializeShows() {
        initializeArea(showsContinueArea, null, label);

        if (!continueShows || continueShows.length === 0) {
            showsContinueArea.classList.add("inactive");
        } else {
            await preloadImages(continueShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
            initializeArea(showsContinueArea, continueShows, label);
            showsContinueArea.classList.remove("inactive");
        }
    }

    function check() {
        const newContinueMovies = getContinueWatching("movie");
        const newContinueShows = getContinueWatching("tv");

        if (continueMovies.length === 0 && newContinueMovies.length > 0 || JSON.stringify(newContinueMovies) !== JSON.stringify(continueMovies)) {
            continueMovies = newContinueMovies;
            initializeMovies();
        }

        if (continueShows.length === 0 && newContinueMovies.length > 0 || JSON.stringify(newContinueShows) !== JSON.stringify(continueShows)) {
            continueShows = newContinueShows;
            initializeShows();
        }
    }

    check();
    setInterval(check, 500);
}