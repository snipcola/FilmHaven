import { config } from "../config.js";
import { splitArray, onWindowResize } from "../functions.js";
import { preloadImages } from "../cache.js";
import { getTrending } from "../tmdb/trending.js";
import { getRated } from "../tmdb/rated.js";
import { getNew } from "../tmdb/new.js";
import { watchContent } from "./watch.js";

export function initializeArea(area, initialSlides, labelText) {
    if (!initialSlides || initialSlides.length === 0) {
        return console.error(`Failed to initialize ${labelText} area.`);
    }

    let desktop = window.innerWidth > config.area.split.max;
    let slides = splitArray(initialSlides, config.area.split[desktop ? "desktop" : "mobile"]);
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

    previous.append(previousIcon);
    next.append(nextIcon);

    control.append(previous);
    control.append(indicators);
    control.append(next);

    cards.className = "cards";

    function add(info) {
        const card = document.createElement("div");
        const image = document.createElement("img");
        const title = document.createElement("div");

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
        title.className = "title";

        card.addEventListener("click", function () {
            watchContent(info.type, info.id);
        });

        title.innerText = info.title.length > config.area.maxTitleLength
            ? info.title.substring(0, config.area.maxTitleLength).replace(/\s+\S*$/, "...")
            : info.title;

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
        card.append(title);
        card.append(footer);
        card.append(play);

        cards.append(card);
    }

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

        cards.innerHTML = "";
        slide.forEach(add);

        setIndicators();
    }

    function setPrevious() {
        set(slides[index - 1] ? index - 1 : slides.length - 1);
    }

    function setNext() {
        set(slides[index + 1] ? index + 1 : 0);
    }

    function checkResize() {
        const newDesktop = window.innerWidth > config.area.split.max;

        if (desktop !== newDesktop) {
            desktop = newDesktop;

            if (slides && slides.length !== 0) {
                slides = splitArray(initialSlides, config.area.split[desktop ? "desktop" : "mobile"]);

                index = index === 0 ? 0 : desktop
                    ? Math.round((index + 1) / (config.area.split.desktop / config.area.split.mobile)) - 1
                    : Math.round((index + 1) * (config.area.split.desktop / config.area.split.mobile)) - 2;

                set(index);
            }
        }
    }

    onWindowResize(checkResize);
    set(index);

    previous.addEventListener("click", setPrevious);
    next.addEventListener("click", setNext);

    area.append(label);
    area.append(control);
    area.append(cards);
    
    area.classList.add("active");
}

export async function initializeAreas() {
    const desktop = window.innerWidth > config.area.split.max;

    const moviesSection = document.querySelector(".section.movies");
    const showsSection = document.querySelector(".section.shows");

    if (!moviesSection || !showsSection) {
        return console.error("Failed to find sections.");
    }

    const moviesTrendingArea = document.createElement("div");
    const showsTrendingArea = document.createElement("div");

    const moviesRatedArea = document.createElement("div");
    const showsRatedArea = document.createElement("div");

    const moviesNewArea = document.createElement("div");
    const showsNewArea = document.createElement("div");

    moviesTrendingArea.className = "area";
    showsTrendingArea.className = "area";

    moviesRatedArea.className = "area";
    showsRatedArea.className = "area";

    moviesNewArea.className = "area";
    showsNewArea.className = "area";

    moviesSection.append(moviesTrendingArea);
    showsSection.append(showsTrendingArea);

    moviesSection.append(moviesRatedArea);
    showsSection.append(showsRatedArea);

    moviesSection.append(moviesNewArea);
    showsSection.append(showsNewArea);

    let trendingMovies = await getTrending("movie");
    let trendingShows = await getTrending("tv");

    if (!trendingMovies || !trendingShows) {
        console.error("Failed to fetch trending content.");
    } else {
        trendingMovies.splice(0, config.carousel.amount);
        trendingShows.splice(0, config.carousel.amount);

        trendingMovies.splice(config.area.amount, trendingMovies.length);
        trendingShows.splice(config.area.amount, trendingShows.length);

        await preloadImages(trendingMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
        await preloadImages(trendingShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);

        initializeArea(moviesTrendingArea, trendingMovies, "Trending");
        initializeArea(showsTrendingArea, trendingShows, "Trending");
    }

    let ratedMovies = await getRated("movie");
    let ratedShows = await getRated("tv");

    if (!ratedMovies || !ratedShows) {
        console.error("Failed to fetch top-rated content.");
    } else {
        ratedMovies.splice(config.area.amount, ratedMovies.length);
        ratedShows.splice(config.area.amount, ratedShows.length);

        await preloadImages(ratedMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
        await preloadImages(ratedShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);

        initializeArea(moviesRatedArea, ratedMovies, "Top-Rated");
        initializeArea(showsRatedArea, ratedShows, "Top-Rated");
    }

    let newMovies = await getNew("movie");
    let newShows = await getNew("tv");

    if (!newMovies || !newShows) {
        console.error("Failed to fetch new content.");
    } else {
        newMovies.splice(config.area.amount, newMovies.length);
        newShows.splice(config.area.amount, newShows.length);

        await preloadImages(newMovies.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
        await preloadImages(newShows.map((i) => i.image), config.area.split[desktop ? "desktop" : "mobile"]);
        
        initializeArea(moviesNewArea, newMovies, "New");
        initializeArea(showsNewArea, newShows, "New");
    }
}