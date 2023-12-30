import { config } from "../config.js";
import { isHovered } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";
import { watchContent } from "./watch.js";

function initializeCarousel(carousel, slides) {
    carousel.innerHTML = "";

    let index = 0;

    const image = document.createElement("img");
    const vignette = document.createElement("div");

    const details = document.createElement("div");
    const title = document.createElement("h2");
    const description = document.createElement("p");
    const buttons = document.createElement("div");
    const button = document.createElement("div");
    const buttonIcon = document.createElement("i");
    const buttonText = document.createElement("span");

    const control = document.createElement("div");
    const previous = document.createElement("div");
    const previousIcon = document.createElement("i");
    const indicators = document.createElement("div");
    const next = document.createElement("div");
    const nextIcon = document.createElement("i");

    image.className = "image";
    vignette.className = "vignette";

    details.className = "details";
    title.className = "title";
    description.className = "description";

    buttons.className = "buttons";
    button.className = "button";
    buttonIcon.className = "icon fa-solid fa-play";
    buttonText.className = "text";
    buttonText.innerText = "Watch Content";

    button.append(buttonIcon);
    button.append(buttonText);
    buttons.append(button);
    
    details.append(title);
    details.append(description);
    details.append(buttons);

    control.className = "control";
    previous.className = "button secondary icon-only previous";
    previousIcon.className = "icon fa-solid fa-arrow-left";
    indicators.className = "indicators";
    next.className = "button secondary icon-only next";
    nextIcon.className = "icon fa-solid fa-arrow-right";

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(indicators);
    control.append(next);

    function setIndicators() {
        indicators.innerHTML = "";

        slides.forEach(function (_, i) {
            const indicator = document.createElement("div");

            indicator.className = index === i ? "indicator active" : "indicator";
            indicator.addEventListener("click", function () {
                set(i);
            });

            indicators.append(indicator);
        });
    }

    function set(newIndex) {
        index = slides[newIndex] ? newIndex : 0;
        const slide = slides[index];

        button.onclick = function () {
            watchContent(slide.type, slide.id);
        };

        image.src = slide.backdrop;
        title.innerText = slide.title;
        description.innerText = slide.description;

        setIndicators();
    }

    function setPrevious() {
        set(slides[index - 1] ? index - 1 : slides.length - 1);
    }

    function setNext() {
        set(slides[index + 1] ? index + 1 : 0);
    }

    function iterate() {
        if (!isHovered(carousel)) {
            setNext();
        }
    }

    if (slides) {
        set(index);
        setInterval(iterate, config.carousel.switchSlideInterval);

        previous.addEventListener("click", setPrevious);
        next.addEventListener("click", setNext);
    }

    carousel.append(image);
    carousel.append(vignette);

    if (slides) {
        carousel.append(details);
        carousel.append(control);
    }
}

export function initializeCarousels() {
    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to find sections.");
    }

    const moviesCard = document.createElement("div");
    const showsCard = document.createElement("div");

    moviesCard.className = "carousel";
    showsCard.className = "carousel";

    moviesSection.append(moviesCard);
    showsSection.append(showsCard);

    async function initializeMovies() {
        initializeCarousel(moviesCard, null);
        let movies = await getTrending("movie");

        if (movies) {
            movies.splice(config.carousel.amount, movies.length);
            preloadImages(movies.map((i) => i.backdrop));
            initializeCarousel(moviesCard, movies);
        }
    }

    async function initializeShows() {
        initializeCarousel(showsCard, null);
        let shows = await getTrending("tv");

        if (shows) {
            shows.splice(config.carousel.amount, shows.length)
            preloadImages(shows.map((i) => i.backdrop));
            initializeCarousel(showsCard, shows);
        }
    }

    initializeMovies();
    initializeShows();
}