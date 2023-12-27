import { config, tmdb } from "../config.js";
import { isHovered } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";

function initializeCarousel(card, slides) {
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

    function set(newIndex) {
        const slide = slides[newIndex];

        if (!slide) {
            return;
        }

        index = newIndex;

        image.src = slide.backdrop;
        title.innerText = slide.title;
        description.innerText = slide.description.length > config.carousel.maxDescriptionLength
            ? slide.description.substring(0, config.carousel.maxDescriptionLength).replace(/\s+\S*$/, "...")
            : slide.description;

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

    function iterate() {
        if (!isHovered(card)) {
            setNext();
        }
    }
    
    setInterval(iterate, config.carousel.switchSlideInterval);
    set(index);

    card.append(image);
    card.append(vignette);
    card.append(details);
    card.append(control);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);

    Array.from(indicators.children).forEach(function (indicator, i) {
        indicator.addEventListener("click", function () {
            set(i);
        });
    });
}

function preload(slides) {
    const images = slides.map((m) => m.backdrop);
    preloadImages(images);
}

export async function initializeCarousels() {
    const moviesCard = document.querySelector(".section.movies .carousel");
    const showsCard = document.querySelector(".section.shows .carousel");

    if (!moviesCard || !showsCard) {
        return console.error("Failed to initialize carousels.");
    }

    let movies = await getTrending("movie");
    let shows = await getTrending("tv");

    movies.splice(tmdb.carousel.moviesAmount, movies.length);
    shows.splice(tmdb.carousel.showsAmount, shows.length)

    preload(movies);
    preload(shows);
    
    initializeCarousel(moviesCard, movies);
    initializeCarousel(showsCard, shows);
}