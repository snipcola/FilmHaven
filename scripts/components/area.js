import { config } from "../config.js";
import { splitArray, onWindowResize } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";
import { getRated } from "../tmdb/rated.js";
import { getNew } from "../tmdb/new.js";

function initializeArea(area, labelText, initialSlides) {
    let desktop = window.innerWidth > config.area.split.max;
    let slides = splitArray(initialSlides, desktop ? config.area.split.desktop : config.area.split.mobile);
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
        const card = document.createElement("div");
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

        if (info.date) {
            footer.append(date);
        }

        if (info.rating && info.stars) {
            footer.append(rating);
        }

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
        const newDesktop = window.innerWidth > config.area.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;
            slides = splitArray(initialSlides, desktop ? config.area.split.desktop : config.area.split.mobile);

            index = index === 0 ? 0 : desktop
                ? Math.round((index + 1) / (config.area.split.desktop / config.area.split.mobile)) - 1
                : Math.round((index + 1) * (config.area.split.desktop / config.area.split.mobile)) - 2;

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
    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to initialize areas.");
    }

    const moviesTrendingArea = document.createElement("div");
    const showsTrendingArea = document.createElement("div");

    const moviesRatedArea = document.createElement("div");
    const showsRatedArea = document.createElement("div");

    const moviesNewArea = document.createElement("div");
    const showsNewArea = document.createElement("div");

    moviesTrendingArea.className = "area trending";
    showsTrendingArea.className = "area trending";

    moviesRatedArea.className = "area rated";
    showsRatedArea.className = "area rated";

    moviesNewArea.className = "area new";
    showsNewArea.className = "area new";

    moviesSection.append(moviesTrendingArea);
    showsSection.append(showsTrendingArea);

    moviesSection.append(moviesRatedArea);
    showsSection.append(showsRatedArea);

    moviesSection.append(moviesNewArea);
    showsSection.append(showsNewArea);

    let trendingMovies = await getTrending("movie");
    let trendingShows = await getTrending("tv");

    if (!trendingMovies || !trendingShows) {
        return console.error("Failed to initialize areas.");
    }

    trendingMovies.splice(0, config.carousel.amount);
    trendingShows.splice(0, config.carousel.amount);

    trendingMovies.splice(config.area.amount, trendingMovies.length);
    trendingShows.splice(config.area.amount, trendingShows.length);

    preloadImages(trendingMovies.map((m) => m.image));
    preloadImages(trendingShows.map((s) => s.image));

    initializeArea(moviesTrendingArea, "Trending", trendingMovies);
    initializeArea(showsTrendingArea, "Trending", trendingShows);

    let ratedMovies = await getRated("movie");
    let ratedShows = await getRated("tv");

    if (!ratedMovies || !ratedShows) {
        return console.error("Failed to initialize areas.");
    }

    ratedMovies.splice(config.area.amount, ratedMovies.length);
    ratedShows.splice(config.area.amount, ratedShows.length);

    preloadImages(ratedMovies.map((m) => m.image));
    preloadImages(ratedShows.map((s) => s.image));

    initializeArea(moviesRatedArea, "Top-Rated", ratedMovies);
    initializeArea(showsRatedArea, "Top-Rated", ratedShows);

    let newMovies = await getNew("movie");
    let newShows = await getNew("tv");

    if (!newMovies || !newShows) {
        return console.error("Failed to initialize areas.");
    }

    newMovies.splice(config.area.amount, newMovies.length);
    newShows.splice(config.area.amount, newShows.length);

    preloadImages(newMovies.map((m) => m.image));
    preloadImages(newShows.map((s) => s.image));

    initializeArea(moviesNewArea, "New", newMovies);
    initializeArea(showsNewArea, "New", newShows);
}