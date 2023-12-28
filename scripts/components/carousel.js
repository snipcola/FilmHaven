import { config } from "../config.js";
import { isHovered } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";

function initializeCarousel(card, slides) {
    card.innerHTML = "";

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

    function set(newIndex) {
        index = slides[newIndex] ? newIndex : 0;

        const slide = slides[newIndex];

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

    function iterate() {
        if (!isHovered(card)) {
            setNext();
        }
    }

    setupIndicators();
    set(index);

    setInterval(iterate, config.carousel.switchSlideInterval);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);

    card.append(image);
    card.append(vignette);
    card.append(details);
    card.append(control);
}

export async function initializeCarousels() {
    const moviesCard = document.querySelector(".section.movies .carousel");
    const showsCard = document.querySelector(".section.shows .carousel");

    if (!moviesCard || !showsCard) {
        return console.error("Failed to initialize carousels.");
    }

    let movies = await getTrending("movie");
    let shows = await getTrending("tv");

    if (!movies || !shows) {
        return console.error("Failed to initialize carousels.");
    }

    movies.splice(config.carousel.amount, movies.length);
    shows.splice(config.carousel.amount, shows.length)

    preloadImages(movies.map((m) => m.backdrop));
    preloadImages(shows.map((s) => s.backdrop));
    
    initializeCarousel(moviesCard, movies);
    initializeCarousel(showsCard, shows);
}