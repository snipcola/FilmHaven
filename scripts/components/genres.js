import { config } from "../config.js";
import { splitArray, onWindowResize } from "../functions.js";
import { getGenres } from "../tmdb/genres.js";
import { setModal, showModal } from "./modal.js";
import { initializeArea } from "./area.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";
import { getRated } from "../tmdb/rated.js";
import { getNew } from "../tmdb/new.js";
import { getHash, onHashChange, removeHash, setHash } from "../hash.js";

async function modal(info, type) {
    const popularArea = document.createElement("div");
    const ratedArea = document.createElement("div");
    const newArea = document.createElement("div");

    popularArea.className = "area";
    ratedArea.className = "area";
    newArea.className = "area";

    let popularContent = await getTrending(type, info.id);
    let ratedContent = await getRated(type, info.id);
    let newContent = await getNew(type, info.id);

    if (!popularContent || !ratedContent || !newContent) {
        return console.error(`Failed to initialize ${info.name} genre.`);
    }

    popularContent.splice(config.area.amount, popularContent.length);
    ratedContent.splice(config.area.amount, ratedContent.length);
    newContent.splice(config.area.amount, newContent.length);

    preloadImages(popularContent.map((c) => c.image));
    preloadImages(ratedContent.map((c) => c.image));
    preloadImages(newContent.map((c) => c.image));

    initializeArea(popularArea, "Popular", popularContent);
    initializeArea(ratedArea, "Top-Rated", ratedContent);
    initializeArea(newArea, "New", newContent);

    setModal(info.name, [popularArea, ratedArea, newArea], "arrow-left", true, "modal");
    showModal();
}

function initializeGenreArea(area, initialSlides, type) {
    let desktop = window.innerWidth > config.genre.split.max;
    let slides = splitArray(initialSlides, desktop ? config.genre.split.desktop : config.genre.split.mobile);
    let index = 0;

    const label = document.createElement("div");

    const control = document.createElement("div");
    const previous = document.createElement("div");
    const previousIcon = document.createElement("i");
    const indicators = document.createElement("div");
    const next = document.createElement("div");
    const nextIcon = document.createElement("i");

    const genres = document.createElement("div");

    label.className = "label";
    label.innerText = "Genres";

    control.className = "control";
    previous.className = "button secondary icon-only previous";
    previousIcon.className = "icon fa-solid fa-arrow-left";
    indicators.className = "indicators";
    next.className = "button secondary icon-only next";
    nextIcon.className = "icon fa-solid fa-arrow-right";

    slides.forEach(function () {
        const indicator = document.createElement("div");
        indicator.className = "indicator";
        indicators.append(indicator);
    });

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(indicators);
    control.append(next);

    genres.className = "genres";

    function add(info) {
        const genre = document.createElement("div");
        const genreText = document.createElement("span");
        const genreIcon = document.createElement("i");

        genre.className = "genre";
        genreText.className = "text";
        genreText.innerText = info.name;
        genreIcon.className = "icon fa-solid fa-arrow-right";

        genre.addEventListener("click", function () {
            setHash("modal", `genre-${type}-${info.id}`);
        });

        genre.append(genreText);
        genre.append(genreIcon);

        genres.append(genre);
    }

    function set(newIndex) {
        index = slides[newIndex] ? newIndex : 0;

        const slide = slides[index];

        genres.innerHTML = "";
        slide.forEach(add);

        Array.from(indicators.children).forEach(function (indicator, i) {
            indicator.classList[index === i ? "add" : "remove"]("active");
        });
    }

    function setPrevious() {
        set(slides[index - 1] ? index - 1 : slides.length - 1);
    }

    function setNext() {
        set(slides[index + 1] ? index + 1 : 0);
    }

    function setupIndicators() {
        indicators.innerHTML = "";

        slides.forEach(function () {
            const indicator = document.createElement("div");
            indicator.className = "indicator";
            indicators.append(indicator);
        });

        Array.from(indicators.children).forEach(function (indicator, i) {
            indicator.addEventListener("click", function () {
                set(i);
            });
        });
    }

    function checkResize() {
        const newDesktop = window.innerWidth > config.genre.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            slides = splitArray(initialSlides, desktop ? config.genre.split.desktop : config.genre.split.mobile);

            index = index === 0 ? 0 : desktop
                ? Math.round((index + 1) / (config.genre.split.desktop / config.genre.split.mobile)) - 1
                : Math.round((index + 1) * (config.genre.split.desktop / config.genre.split.mobile)) - 2;

            setupIndicators();
            set(index);
        }
    }

    onWindowResize(checkResize);

    setupIndicators();
    set(index);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);

    area.append(label);
    area.append(control);
    area.append(genres);
    
    area.classList.add("active");
}

export async function initializeGenres() {
    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to initialize genres.");
    }

    const moviesGenresArea = document.createElement("div");
    const showsGenresArea = document.createElement("div");

    moviesGenresArea.className = "area genres";
    showsGenresArea.className = "area genres";

    moviesSection.append(moviesGenresArea);
    showsSection.append(showsGenresArea);

    let movieGenres = await getGenres("movie");
    let showGenres = await getGenres("tv");

    if (!movieGenres || !showGenres) {
        return console.error("Failed to initialize genres.");
    }

    async function handleHashChange() {
        const modalHash = getHash("modal");
        
        if (modalHash) {
            const [modalType, type, id] = modalHash.split("-");

            if (modalType === "genre") {
                const info = type === "movie"
                    ? movieGenres.find((g) => g.id?.toString() === id)
                    : showGenres.find((g) => g.id?.toString() === id);

                if (info) {
                    await modal(info, type);
                    document.title = `${type === "movie" ? "Movies" : "Shows"} - ${info.name}`;
                } else {
                    removeHash("modal");
                }
            }
        }
    }

    handleHashChange();
    onHashChange(handleHashChange);

    initializeGenreArea(moviesGenresArea, movieGenres, "movie");
    initializeGenreArea(showsGenresArea, showGenres, "tv");
}