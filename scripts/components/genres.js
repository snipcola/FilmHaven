import { config } from "../config.js";
import { splitArray, onWindowResize } from "../functions.js";
import { getGenres } from "../tmdb/genres.js";

function initializeGenreArea(area, initialSlides) {
    area.innerHTML = "";

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
    const moviesGenresArea = document.querySelector(".section.movies .area.genres");
    const showsGenresArea = document.querySelector(".section.shows .area.genres");

    if (!moviesGenresArea || !showsGenresArea) {
        return console.error("Failed to initialize genres.");
    }

    let movieGenres = await getGenres("movie");
    let showGenres = await getGenres("tv");

    if (!movieGenres || !showGenres) {
        return console.error("Failed to initialize genres.");
    }

    initializeGenreArea(moviesGenresArea, movieGenres);
    initializeGenreArea(showsGenresArea, showGenres);
}