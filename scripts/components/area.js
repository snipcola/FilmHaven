import { tmdb } from "../config.js";
import { splitArray, onWindowResize } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";

function initializeArea(area, labelText, initialSlides) {
    area.innerHTML = "";

    let desktop = window.innerWidth > tmdb.area.split.max;
    let slides = splitArray(initialSlides, desktop ? tmdb.area.split.desktop : tmdb.area.split.mobile);
    let index = 0;

    const label = document.createElement("div");

    const control = document.createElement("div");
    const previous = document.createElement("div");
    const previousIcon = document.createElement("i");
    const indicators = document.createElement("div");
    const next = document.createElement("div");
    const nextIcon = document.createElement("i");

    const cards = document.createElement("div");

    label.className = "label";
    label.innerText = labelText;

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

    cards.className = "cards";

    function add(info) {
        const card = document.createElement("card");
        const image = document.createElement("img");

        const footer = document.createElement("div");

        const date = document.createElement("div");
        const dateIcon = document.createElement("i");
        const dateText = document.createElement("span");

        const rating = document.createElement("div");
        const stars = document.createElement("div");
        const starsAmount = document.createElement("div");

        const play = document.createElement("div");
        const playIcon = document.createElement("i");

        card.className = "card";
        image.className = "image";
        image.src = info.image;

        footer.className = "footer";

        date.className = "date";
        dateIcon.className = "icon fa-solid fa-clock";
        dateText.className = "text";
        dateText.innerText = info.date;

        date.append(dateIcon);
        date.append(dateText);

        rating.className = "rating";
        stars.className = "stars";
        starsAmount.className = "amount text";
        starsAmount.innerText = info.stars;

        for (var i = 0; i < 5; i++) {
            const star = document.createElement("div");
            const starIcon = document.createElement("i");

            star.className = i < info.rating ? "star fill" : "star";
            starIcon.className = "icon fa-solid fa-star";

            star.append(starIcon);
            stars.append(star);
        }

        rating.append(stars);
        rating.append(starsAmount);

        footer.append(date);
        footer.append(rating);

        play.className = "play";
        playIcon.className = "icon fa-solid fa-play";

        play.append(playIcon);

        card.append(image);
        card.append(footer);
        card.append(play);

        cards.append(card);
    }

    function set(newIndex) {
        index = slides[newIndex] ? newIndex : 0;

        const slide = slides[index];

        cards.innerHTML = "";
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
        const newDesktop = window.innerWidth > tmdb.area.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            slides = splitArray(initialSlides, desktop ? tmdb.area.split.desktop : tmdb.area.split.mobile);

            index = index === 0 ? 0 : desktop
                ? Math.round((index + 1) / (tmdb.area.split.desktop / tmdb.area.split.mobile)) - 1
                : Math.round((index + 1) * (tmdb.area.split.desktop / tmdb.area.split.mobile)) - 2;

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
    area.append(cards);
    
    area.classList.add("active");
}

export async function initializeAreas() {
    const moviesTrendingArea = document.querySelector(".section.movies .area.trending");
    const showsTrendingArea = document.querySelector(".section.shows .area.trending");

    if (!moviesTrendingArea || !showsTrendingArea) {
        return console.error("Failed to initialize areas.");
    }

    let trendingMovies = await getTrending("movie");
    let trendingShows = await getTrending("tv");

    trendingMovies.splice(0, tmdb.carousel.amount);
    trendingShows.splice(0, tmdb.carousel.amount);

    trendingMovies.splice(tmdb.area.amount, trendingMovies.length);
    trendingShows.splice(tmdb.area.amount, trendingShows.length);

    preloadImages(trendingMovies.map((m) => m.image));
    preloadImages(trendingShows.map((s) => s.image));

    initializeArea(moviesTrendingArea, "Trending", trendingMovies);
    initializeArea(showsTrendingArea, "Trending", trendingShows);
}